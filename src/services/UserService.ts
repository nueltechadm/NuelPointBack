import User from "../core/entities/User";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import {MD5} from '../utils/Cryptography';
import ObjectNotFoundExcpetion from "../exceptions/ObjectNotFoundExcpetion";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";

export default class UserService  extends AbstractUserService
{
   
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public IsCompatible(obj: any): obj is User {
        return Type.HasKeys<User>(obj, "Username", "Name", "Email", "Password");
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.Users.CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<User| undefined> {
        
        return await this._context.Users.Where(
                                        {
                                            Field : "Id", 
                                            Value : id
                                        })
                                        .Join("Permissions")
                                        .Join("Company")
                                        .Join("Period")
                                        .FirstOrDefaultAsync();
        
    }
    public override async GetByNameAsync(name: string): Promise<User[]> {

        return await this._context.Users.WhereField("Name").Constains(name).Join("Permissions").Join("Company").Join("Period").ToListAsync() ?? [];
    }

    public override async GetByUserNameAndPasswordAsync(username: string, password : string): Promise<User | undefined> {

       return await this._context.Users
                                .WhereField("Username").IsEqualTo(username)
                                .AndField("Password").IsEqualTo(MD5(password))
                                .AndLoadAll("Permissions")
                                .AndLoadAll("Company")
                                .AndLoadAll("Period")
                                .FirstOrDefaultAsync();           
     
    }

    public override async GetByEmailAsync(email: string): Promise<User | undefined> {

        return await this._context.Users.Where(
                                            {
                                                Field : "Email", 
                                                Value : email
                                            })
                                            .Join("Permissions")
                                            .Join("Company")
                                            .Join("Period")
                                            .FirstOrDefaultAsync();
    }

    public override async AddAsync(obj: User): Promise<User> 
    { 
        await this.SyncPermissionsAsync(obj);

        if(!obj.Company)
            throw new InvalidEntityException("The company of the user is required");

        if(!obj.JobRole)
            throw new InvalidEntityException("The jobrole of the user is required");        

        obj.Password = MD5(obj.Password);

        return await this._context.Users.AddAsync(obj)!;        
    }

    public override async UpdateAsync(obj: User): Promise<User> {

        let curr = await this.GetByIdAsync(obj.Id);

        if(!curr)
            throw new ObjectNotFoundExcpetion(`This user do not exists on database`);

        if(curr.Password != obj.Password)
            obj.Password = MD5(obj.Password);
        
        await this.SyncPermissionsAsync(obj);

        if(!obj.Company)
            throw new InvalidEntityException("The company of the user is required");

        if(!obj.JobRole)
            throw new InvalidEntityException("The jobrole of the user is required");         

        return await this._context.Users.UpdateAsync(obj)!;
    }

    public override async DeleteAsync(obj: User): Promise<User> {

       return await this._context.Users.DeleteAsync(obj)!;
    }

    public override async GetAllAsync(): Promise<User[]> {

        return await this._context.Users.OrderBy("Name").ToListAsync()!;
    }   

    private async SyncPermissionsAsync(obj : User) : Promise<void>
    {
        let permissionsIds = obj.Permissions != undefined ? obj.Permissions.map(s => s.Id) : [];

        if(permissionsIds)
        {
            obj.Permissions = await this._context.Permissions.WhereField("Id").IsInsideIn(permissionsIds).ToListAsync();
        }
    }

}

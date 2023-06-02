import User from "../core/entities/User";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import {MD5} from '../utils/Cryptography';
import ObjectNotFoundExcpetion from "../exceptions/ObjectNotFoundExcpetion";

export default class UserService  extends AbstractUserService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override async GetByIdAsync(id: number): Promise<User| undefined> {
        
        return await this._context.Users.Where(
                                        {
                                            Field : "Id", 
                                            Value : id
                                        })
                                        .Join("Permissions")
                                        .FirstOrDefaultAsync();
        
    }
    public override async GetByNameAsync(name: string): Promise<User[]> {

        return await this._context.Users.WhereField("Name").Constains(name).Join("Permissions").ToListAsync() ?? [];
    }

    public override async GetByUserNameAndPasswordAsync(username: string, password : string): Promise<User | undefined> {

       return await this._context.Users
                                .WhereField("Username").IsEqualTo(username)
                                .AndField("Password").IsEqualTo(MD5(password))
                                .AndLoadAll("Permissions")
                                .FirstOrDefaultAsync();           
     
    }

    public override async GetByEmailAsync(email: string): Promise<User | undefined> {

        return await this._context.Users.Where(
                                            {
                                                Field : "Email", 
                                                Value : email
                                            })
                                            .Join("Permissions")
                                            .FirstOrDefaultAsync();
    }

    public override async AddAsync(obj: User): Promise<User> 
    { 
        await this.SyncPermissionsAsync(obj);

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

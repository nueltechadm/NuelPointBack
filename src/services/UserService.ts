import User from "../core/entities/User";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import {MD5} from '../utils/Cryptography';
import ObjectNotFoundExcpetion from "../exceptions/ObjectNotFoundExcpetion";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Access from "../core/entities/Access";
import { Inject } from "web_api_base";
import AbstractDBContext from "../data/abstract/AbstractDBContext";
import Permission from "../core/entities/Permission";


export default class UserService  extends AbstractUserService
{      
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is User {
        return Type.HasKeys<User>(obj, "Name", "Email");
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {    
        await this._context.SetDatabaseAsync(client);
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(User).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async CountAsync(): Promise<number> {
        
        return await this._context.Collection(User).CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<User| undefined> {
        
        return await this._context.Collection(User).Where(
                                        {
                                            Field : "Id", 
                                            Value : id
                                        })                                        
                                        .Join("Access")
                                        .Join("Company")                                        
                                        .Join("Contacts")   
                                        .Join("JobRole")
                                        .Join("Journey")                                     
                                        .FirstOrDefaultAsync();
        
    }
    public override async GetByNameAsync(name: string): Promise<User[]> {

        return await this._context.Collection(User).WhereField("Name").Constains(name).Join("Company").ToListAsync() ?? [];
    }

    public override async GetByUserNameAndPasswordAsync(username: string, password : string): Promise<Access | undefined> {

       let access = await this._context.Join(User, Access)
                                    .On(User, "Access", Access, "User")
                                    .Where(Access, { Field : "Username", Value : username})
                                    .And(Access, { Field : "Password", Value : MD5(password)})       
                                    .Select(Access)                                    
                                    .Join("User")
                                    .Join("Permissions")
                                    .Join("Departaments")
                                    .Join("Company")                                    
                                    .FirstOrDefaultAsync();   
        if(!access)
            return undefined;
        
        delete (access as any).Password;
        return access;
     
    }

    public override async GetByAndLoadAsync<K extends keyof User>(key: K, value: User[K], load: (keyof User)[]): Promise<User[]> 
    {
       this._context.Collection(User).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(User).Join(l);
        
       return await this._context.Collection(User).ToListAsync();
    } 

    public override async GetByEmailAsync(email: string): Promise<User | undefined> 
    {       

        return await this._context.Collection(User).Where(
                                            {
                                                Field : "Email", 
                                                Value : email
                                            })                                            
                                            .Join("Company")                                            
                                            .FirstOrDefaultAsync();
    }

    public override async AddAsync(obj: User): Promise<User> 
    { 
        if(!obj.Access || obj.Access.Id < 1)
            throw new InvalidEntityException("Access is required");

        obj.Access = await this.GetAccessByIdAsync(obj.Access.Id);

        if(!obj.Access)
            throw new InvalidEntityException("To create a user, you must select a valid access object");

        await this.SyncPermissionsAsync(obj.Access);

        if(!obj.Company && !obj.IsSuperUser)
            throw new InvalidEntityException("The company of the user is required");

        if(!obj.JobRole && !obj.IsSuperUser)
            throw new InvalidEntityException("The jobrole of the user is required");        

        obj.Access!.Password = MD5(obj.Access!.Password);

        return await this._context.Collection(User).AddAsync(obj)!;        
    }

    public override async UpdateAsync(obj: User): Promise<User> {

        this.ValidateObject(obj);

        let curr = await this.GetByIdAsync(obj.Id);

        if(!curr)
            throw new ObjectNotFoundExcpetion(`This user do not exists on database`);

        if(obj.Access && curr.Access!.Password != obj.Access!.Password)
        {
            obj.Access!.Password = MD5(obj.Access!.Password);
        
            await this.SyncPermissionsAsync(obj.Access!);
        }            

        return await this._context.Collection(User).UpdateAsync(obj)!;
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof User>(obj: User, relations: U[]): Promise<User> {

        this.ValidateObject(obj);

        let curr = await this.GetByIdAsync(obj.Id);

        if(!curr)
            throw new ObjectNotFoundExcpetion(`This user do not exists on database`);

        if(obj.Access && curr.Access!.Password != obj.Access!.Password)
        {
            obj.Access!.Password = MD5(obj.Access!.Password);
        
            await this.SyncPermissionsAsync(obj.Access!);
        }            

        return await this._context.Collection(User).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public override async DeleteAsync(obj: User): Promise<User> {

       return await this._context.Collection(User).DeleteAsync(obj)!;
    }

    public override async GetAllAsync(): Promise<User[]> {

        return await this._context.Collection(User).OrderBy("Name").ToListAsync()!;
    }  
    
    public override ValidateObject(obj : User) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${User.name} type`); 

        if(!obj.Email && !obj.IsSuperUser)
          throw new InvalidEntityException(`The email of user is required`);

        if(!obj.Name && !obj.IsSuperUser)
          throw new InvalidEntityException(`The name of user is required`);

        if(!obj.Company && !obj.IsSuperUser)
          throw new InvalidEntityException("The company of the user is required");

       if(!obj.JobRole && !obj.IsSuperUser)
          throw new InvalidEntityException("The jobrole of the user is required");    
    }

    private async GetAccessByIdAsync(id : number) : Promise<Access | undefined>
    {
        if(id < 1)
            return undefined;

        return await this._context.Collection(Access).Where({ Field : "Id", Value : id}).FirstOrDefaultAsync();
    }

    private async SyncPermissionsAsync(obj : Access) : Promise<void>
    {
        let permissionsIds = obj.Permissions != undefined ? obj.Permissions.map(s => s.Id) : [];

        if(permissionsIds)
        {
            obj.Permissions = await this._context.Collection(Permission).WhereField("Id").IsInsideIn(permissionsIds).ToListAsync();
        }
    }

}




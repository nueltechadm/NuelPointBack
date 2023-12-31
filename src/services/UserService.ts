import User from "@entities/User";
import AbstractUserService from "@contracts/AbstractUserService";
import {MD5} from '@utils/Cryptography';
import ObjectNotFoundExcpetion from "../exceptions/ObjectNotFoundExcpetion";
import Type from "@utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Access from "@entities/Access";
import { Inject } from "web_api_base";
import AbstractDBContext from "@data-contracts/AbstractDBContext";


import { PaginatedFilterRequest, PaginatedFilterResult } from "@contracts/AbstractService";
import Company from "@src/core/entities/Company";
import JobRole from "@src/core/entities/JobRole";


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
        return Type.HasKeys<User>(obj, "Name");
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {    
        await this._context.SetDatabaseAsync(client);
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(User).Where({Field: "Id", Value : id}).CountAsync()) > 0;
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
                                    .Join("Perfil")                                                                       
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

   
    public override async AddAsync(obj: User): Promise<User> 
    { 
        if(!obj.Access)
            throw new InvalidEntityException(`The ${Access.name} of the ${User.name} is required`);
        
        obj.Access.Id = -1;

        obj.Access!.Password = MD5(obj.Access!.Password);  

        if(!obj.Company && !obj.IsSuperUser())
            throw new InvalidEntityException(`The ${Company.name} of the ${User.name} is required`);

        if(!obj.JobRole && !obj.IsSuperUser())
            throw new InvalidEntityException(`The ${JobRole.name} of the ${User.name} is required`); 
        

        return await this._context.Collection(User).AddAsync(obj)!;        
    }

    public override async UpdateAsync(obj: User): Promise<User> 
    {     
        return await this._context.Collection(User).UpdateAsync(obj);        
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof User>(obj: User, relations: U[]): Promise<User> 
    {
        let curr = (await this.GetByAndLoadAsync("Id", obj.Id, relations)).FirstOrDefault();

        if(!curr)
            throw new ObjectNotFoundExcpetion(`This user do not exists on database`);

        if(relations.Any(s => s == "Access") && !obj.Access)        
            throw new InvalidEntityException(`The ${Access.name} of the ${User.name} is required`);
       
        obj.Access.Id = curr.Access?.Id ?? -1;
        
        if(obj.Access.Password != curr.Access.Password)
            obj.Access.Password = MD5(obj.Access.Password);        

        return await this._context.Collection(User).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public override async DeleteAsync(obj: User): Promise<User> {

       return await this._context.Collection(User).DeleteAsync(obj)!;
    }

    public override async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<User>> 
    {
        let offset = (request.Page - 1) * request.Quantity; 

        let total = await this._context.Collection(User).CountAsync();

        let users = await this._context.Collection(User).OrderBy("Name").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<User>();
        result.Page = request.Page;
        result.Quantity = users.Count();
        result.Total = total;
        result.Result = users;

        return result;
    }
    
    public override ValidateObject(obj : User) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${User.name} type`);        

        if(!obj.Name && !obj.IsSuperUser())
          throw new InvalidEntityException(`The name of user is required`);

        if(!obj.Company && !obj.IsSuperUser())
          throw new InvalidEntityException("The company of the user is required");

       if(!obj.JobRole && !obj.IsSuperUser())
          throw new InvalidEntityException("The jobrole of the user is required");    
    }

    private async GetAccessByIdAsync(id : number) : Promise<Access | undefined>
    {
        if(id < 1)
            return undefined;

        return await this._context.Collection(Access).Where({ Field : "Id", Value : id}).FirstOrDefaultAsync();
    }   
}




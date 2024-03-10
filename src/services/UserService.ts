import User from "@entities/User";
import AbstractUserService, { UserPaginatedFilterRequest, UserUnPaginatedFilterRequest, UserUnPaginatedFilterResult } from "@contracts/AbstractUserService";
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
import Departament from "@src/core/entities/Departament";
import { IJoinSelectable, IJoiningQuery, Operation } from "myorm_core";


export default class UserService  extends AbstractUserService
{
           
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public IsCompatible(obj: any): obj is User {
        return Type.HasKeys<User>(obj, "Name");
    }

    public async SetClientDatabaseAsync(client: string): Promise<void> {    
        await this._context.SetDatabaseAsync(client);
    }

    public async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(User).Where({Field: "Id", Value : id}).CountAsync()) > 0;
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.Collection(User).CountAsync();
    }

    public async GetByIdsAsync(ids: number[]): Promise<User[]>
    {
        return await this._context.Collection(User)
                                  .WhereField("Id")
                                  .IsInsideIn(ids)                                    
                                  .Load("Journey")                                     
                                  .ToListAsync();
    } 

    public async GetByIdAsync(id: number): Promise<User| undefined> {
        
        return await this._context.Collection(User).Where(
                                        {
                                            Field : "Id", 
                                            Value : id
                                        })                                        
                                        .Load("Access")
                                        .Load("Company")                                        
                                        .Load("Contacts")   
                                        .Load("JobRole")
                                        .Load("Journey")                                     
                                        .FirstOrDefaultAsync();
        
    }
    public async GetByNameAsync(name: string): Promise<User[]> {

        return await this._context.Collection(User).WhereField("Name").Constains(name).Load("Company").ToListAsync() ?? [];
    }


    public async GetByUserNameAndPasswordAsync(username: string, password : string): Promise<Access | undefined> {

       let access = await this._context.From(User).InnerJoin(Access)
                                    .On(User, "Access", Access, "User")
                                    .Where(Access, { Field : "Username", Value : username})
                                    .And(Access, { Field : "Password", Value : MD5(password)})       
                                    .Select(Access)                                    
                                    .Load("User")
                                    .Load("Perfil")                                                                       
                                    .FirstOrDefaultAsync();   
        if(!access)
            return undefined;
        
        delete (access as any).Password;
        return access;
     
    }

    public async GetByAndLoadAsync<K extends keyof User>(key: K, value: User[K], load: (keyof User)[]): Promise<User[]> 
    {
       this._context.Collection(User).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(User).Load(l);
        
       return await this._context.Collection(User).ToListAsync();
    } 

   
    public async AddAsync(obj: User): Promise<User> 
    { 
        if(!obj.Access)
            throw new InvalidEntityException(`The ${Access.name} of the ${User.name} is required`);

        if(!obj.Access.Password)
            throw new InvalidEntityException(`The password of the ${User.name} is required`);
        
        obj.Access.Id = -1;   
 
        obj.Access!.Password = MD5(obj.Access!.Password);  

        if(!obj.Company && !obj.IsSuperUser())
            throw new InvalidEntityException(`The ${Company.name} of the ${User.name} is required`);

        if(!obj.JobRole && !obj.IsSuperUser())
            throw new InvalidEntityException(`The ${JobRole.name} of the ${User.name} is required`);         

        await this._context.Collection(User).AddAsync(obj)!;     
        
        obj.Directory = MD5(obj.Directory + obj.Id);

        await this._context.Collection(User).UpdateObjectAndRelationsAsync(obj, [])!;   
        
        return obj;
    }

    public async UpdateAsync(obj: User): Promise<User> 
    {     
        return await this._context.Collection(User).UpdateAsync(obj);        
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof User>(obj: User, relations: U[]): Promise<User> 
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


    public async DeleteAsync(obj: User): Promise<User> {

       return await this._context.Collection(User).DeleteAsync(obj)!;
    }

    public async UnPaginatedFilterAsync(request : UserUnPaginatedFilterRequest) : Promise<UserUnPaginatedFilterResult<User>> 
    {
       
        let query = this._context.From(User)
                                 .LeftJoin(Company)
                                 .On(User, "Company", Company, "Id")
                                 .LeftJoin(JobRole)
                                 .On(User, "JobRole", JobRole, "Id")
                                 .LeftJoin(Departament)
                                 .On(JobRole, "Departament", Departament, "Id");
        
        if(request.Name)
            query.Where(User, {Field: "Name", Kind: Operation.CONSTAINS, Value: request.Name});

        if(request.CompanyId !== undefined && request.CompanyId > 0)
            query.Where(Company, {Field: "Id", Value: request.CompanyId});

        if(request.JobRoleId !== undefined && request.JobRoleId > 0)
            query.Where(JobRole, {Field: "Id", Value: request.JobRoleId});

        if(request.DepartamentId !== undefined && request.DepartamentId > 0)
            query.Where(Departament, {Field: "Id", Value: request.DepartamentId});


        let users = await query.Select(User)
                               .Load("Access")
                               .Load("Company")                                        
                               .Load("Contacts")   
                               .Load("JobRole")
                               .Load("Journey")
                               .ToListAsync();                    

        
        await this._context.Collection(JobRole).ReloadCachedRealitionsAsync(users.Where(s => s.JobRole != undefined).Select(s => s.JobRole!), ["Departament"]);

        let result = new UserUnPaginatedFilterResult<User>();
        result.Quantity = users.Count();
        result.Result = users;

        return result;
    }
    

    public override async PaginatedFilterAsync(request : UserPaginatedFilterRequest) : Promise<PaginatedFilterResult<User>> 
    {
        let offset = (request.Page - 1) * request.Quantity; 

        let total = await this.BuildQuery(request).CountAsync();

        let query = this.BuildQuery(request);

        if(request.LoadRelations)
        {
            query.Load("Access")
            .Load("Company")                                        
            .Load("Contacts")   
            .Load("JobRole")
            .Load("Journey");
        }
        

        let users = await query.OrderBy("Name").Offset(offset).Limit(request.Quantity).ToListAsync();

        if(request.LoadRelations)
            await this._context.Collection(JobRole).ReloadCachedRealitionsAsync(users.Where(s => s.JobRole != undefined).Select(s => s.JobRole!), ["Departament"]);

        let result = new PaginatedFilterResult<User>();
        result.Page = request.Page;
        result.Quantity = users.Count();
        result.Total = total;
        result.Result = users;

        return result;
    }


    private BuildQuery(request : UserPaginatedFilterRequest)  : IJoinSelectable<User>
    {
        let query = this._context.From(User)
                                 .LeftJoin(Company)
                                 .On(User, "Company", Company, "Id")
                                 .LeftJoin(JobRole)
                                 .On(User, "JobRole", JobRole, "Id")
                                 .LeftJoin(Departament)
                                 .On(JobRole, "Departament", Departament, "Id");
        
        if(request.Name)
            query.Where(User, {Field: "Name", Kind: Operation.CONSTAINS, Value: request.Name});

        if(request.CompanyId > 0)
            query.Where(Company, {Field: "Id", Value: request.CompanyId});

        if(request.JobRoleId > 0)
            query.Where(JobRole, {Field: "Id", Value: request.JobRoleId});

        if(request.DepartamentId > 0)
            query.Where(Departament, {Field: "Id", Value: request.DepartamentId});

        return query.Select(User);
    } 

    
    public override ValidateObject(obj : User) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`Este objeto não é do tipo ${User.name}`);        

        if(!obj.Name && !obj.IsSuperUser())
          throw new InvalidEntityException(`O nome do usuário é necessário`);

        if(!obj.Company && !obj.IsSuperUser())
          throw new InvalidEntityException("A empresa do usuário é necessária");

       if(!obj.JobRole && !obj.IsSuperUser())
          throw new InvalidEntityException("O cargo do usuário é necessário");    
    }

    private async GetAccessByIdAsync(id : number) : Promise<Access | undefined>
    {
        if(id < 1)
            return undefined;

        return await this._context.Collection(Access).Where({ Field : "Id", Value : id}).FirstOrDefaultAsync();
    }   
}




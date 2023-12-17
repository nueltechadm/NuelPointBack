import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import {Inject} from'web_api_base'
import JobRole from "../core/entities/JobRole";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractDBContext from "../data/abstract/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from "../core/abstractions/AbstractService";

export default class JobRoleService  extends AbstractJobRoleService
{
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is JobRole {        
        return Type.HasKeys<JobRole>(obj, "Description", "Company");  
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(JobRole).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async CountAsync(): Promise<number> {
        
        return await this._context.Collection(JobRole).CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<JobRole | undefined> {       
        return await this._context.Collection(JobRole).WhereField("Id").IsEqualTo(id).LoadRelationOn("Users").FirstOrDefaultAsync();
    }
    
    public override async AddAsync(obj: JobRole): Promise<JobRole> {

        this.ValidateObject(obj);        

        return this._context.Collection(JobRole).AddObjectAndRelationsAsync(obj, []);
    }

    public override async GetByAndLoadAsync<K extends keyof JobRole>(key: K, value: JobRole[K], load: (keyof JobRole)[]): Promise<JobRole[]> 
    {
       this._context.Collection(JobRole).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(JobRole).Join(l);
        
       return await this._context.Collection(JobRole).ToListAsync();
    } 

    public override async UpdateAsync(obj: JobRole): Promise<JobRole> {

        this.ValidateObject(obj);       

        return await this._context.Collection(JobRole).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof JobRole>(obj: JobRole, relations: U[]): Promise<JobRole> {

        this.ValidateObject(obj);

        return await this._context.Collection(JobRole).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public override async DeleteAsync(obj: JobRole): Promise<JobRole> {
        
        if(!obj.Id || obj == undefined)
            throw new InvalidEntityException(`Id is required to delete a ${JobRole.name}`);

        let curr = await this._context.Collection(JobRole).Where({ Field : "Id", Value : obj.Id}).FirstOrDefaultAsync();
        
        if(!curr)
            throw new EntityNotFoundException(`Has no one ${JobRole.name} with Id #${obj.Id} in database`);

        return this._context.Collection(JobRole).DeleteAsync(curr);
    }


    public override async GetAllAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<JobRole>> 
    {
        let offset = request.Page - 1 * request.Quantity; 

        let total = await this._context.Collection(JobRole).CountAsync();

        let jobs = await this._context.Collection(JobRole).OrderBy("Description").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<JobRole>();
        result.Page = request.Page;
        result.Quantity = jobs.Count();
        result.Total = total;
        result.Result = jobs;

        return result;
    }

    public override ValidateObject(obj: JobRole) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${JobRole.name} type`);        

        if(!obj.Description)
            throw new InvalidEntityException(`The description of ${JobRole.name} is required`);       
      
    }
}

import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import JobRole from "../core/entities/JobRole";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";

export default class JobRoleService  extends AbstractJobRoleService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is JobRole {        
        return Type.HasKeys<JobRole>(obj, "Description", "Company");  
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.JobRoles.CountAsync();
    }
    public async GetByIdAsync(id: number): Promise<JobRole | undefined> {       
        return await this._context.JobRoles.WhereField("Id").IsEqualTo(id).AndLoadAll("Company").FirstOrDefaultAsync();
    }
    
    public async AddAsync(obj: JobRole): Promise<JobRole> {

        this.CommonValidation(obj);

        if(!obj.Company)
            throw new InvalidEntityException(`The company of ${JobRole.name} is required`); 

        return this._context.JobRoles.AddAsync(obj);
    }
    public async UpdateAsync(obj: JobRole): Promise<JobRole> {

        this.CommonValidation(obj);

        return this._context.JobRoles.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: JobRole): Promise<JobRole> {
        
        if(!obj.Id || obj == undefined)
            throw new InvalidEntityException(`Id is required to delete a ${JobRole.name}`);

        let curr = await this._context.JobRoles.Where({ Field : "Id", Value : obj.Id}).FirstOrDefaultAsync();
        
        if(!curr)
            throw new EntityNotFoundException(`Has no one ${JobRole.name} with Id #${obj.Id} in database`);

        return this._context.JobRoles.DeleteAsync(curr);
    }
    public async GetAllAsync(): Promise<JobRole[]> {
        return await this._context.JobRoles.OrderBy("Description").ToListAsync();
    }  

    private CommonValidation(obj: JobRole) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${JobRole.name} type`);

        if(!obj.Description)
            throw new InvalidEntityException(`The description of ${JobRole.name} is required`);

        if(!obj.Company)
            throw new InvalidEntityException(`The folder of ${JobRole.name} is required`);
      
    }
}

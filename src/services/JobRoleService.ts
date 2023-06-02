import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import JobRole from "../core/entities/JobRole";

export default class JobRoleService  extends AbstractJobRoleService
{
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public async GetByIdAsync(id: number): Promise<JobRole | undefined> {       
        return await this._context.JobRoles.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }      
    public async AddAsync(obj: JobRole): Promise<JobRole> {
        return this._context.JobRoles.AddAsync(obj);
    }
    public async UpdateAsync(obj: JobRole): Promise<JobRole> {
        return this._context.JobRoles.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: JobRole): Promise<JobRole> {
        return this._context.JobRoles.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<JobRole[]> {
        return await this._context.JobRoles.OrderBy("Description").ToListAsync();
    }  
}

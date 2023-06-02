
import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, Use, Validate } from "web_api_base";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import JobRole from "../core/entities/JobRole";
import {IsLogged} from '../filters/AuthFilter';

@Use(IsLogged)
@Validate()
export default class JobRoleController extends ControllerBase
{   
    @Inject()
    private _service : AbstractJobRoleService;

    constructor(service : AbstractJobRoleService)
    {
        super();                    
        this._service = service;
    }    
    

    @GET("list")
    public async GetAllAsync() : Promise<void>
    {
       let jobs = await this._service.GetAllAsync();

       for(let j of jobs)
       {
            delete (j as any)._orm_metadata_;
            delete (j as any).Employers;
       }

       this.OK(jobs);
    }    
    
    @GET("getById")    
    public async GetByIdAsync(@FromQuery()id : number) : Promise<void>
    { 
       let job = await this._service.GetByIdAsync(id);

       if(!job)
            return this.NotFound({Message : "Job role not found"});
        
        delete (job as any)._orm_metadata_;
        delete (job as any).Employers;

       this.OK(job);
    }          
    
    @POST("insert")
    public async InsertAsync(@FromBody()jobRole : JobRole) : Promise<void>
    {  
        this.OK(await this._service.AddAsync(jobRole));
    }
    
    @PUT("update")   
    public async UpdateAsync(@FromBody()jobRole : JobRole) : Promise<void>
    {        
        if(jobRole.Id == undefined || jobRole.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = await this._service.GetByIdAsync(jobRole.Id);

        if(!update)
            return this.NotFound({Message : "Job role not found"});

        this.OK(await this._service.UpdateAsync(jobRole));
    }

    @DELETE("delete")    
    public async DeleteAsync(@FromQuery()id : number) : Promise<void>
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "Job role not found"});

        this.OK(await this._service.DeleteAsync(del));
    }

    
}
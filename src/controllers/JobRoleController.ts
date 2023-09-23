
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import JobRole from "../core/entities/JobRole";
import {IsLogged} from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Authorization from "../utils/Authorization";

@UseBefore(IsLogged)
@Validate()
export default class JobRoleController extends AbstractController
{   
    @Inject()
    private _service : AbstractJobRoleService;

    constructor(service : AbstractJobRoleService)
    {
        super();                    
        this._service = service;
    }    
    
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._service.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());        
    }

    @GET("list")    
    @SetDatabaseFromToken()
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
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery()id : number) 
    { 
       let job = await this._service.GetByIdAsync(id);

       if(!job)
            return this.NotFound({Message : "Job role not found"});
        
        delete (job as any)._orm_metadata_;
        delete (job as any).Employers;

       this.OK(job);
    }          
    
    @POST("insert")     
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody()jobRole : JobRole) 
    {  
        this.OK(await this._service.AddAsync(jobRole));
    }
    
    @PUT("update")       
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody()jobRole : JobRole) 
    {  
        this.OK(await this._service.UpdateAsync(jobRole));        
    }

    @DELETE("delete")     
    @SetDatabaseFromToken()    
    public async DeleteAsync(@FromQuery()id : number) 
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "Job role not found"});

        this.OK(await this._service.DeleteAsync(del));
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson()
    {
        this.OK(Type.CreateTemplateFrom<JobRole>(JobRole));
    }

    
}




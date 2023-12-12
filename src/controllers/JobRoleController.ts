
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import JobRole from "../core/entities/JobRole";
import {IsLogged} from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Authorization from "../utils/Authorization";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";

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



    @POST("list")     
    @SetDatabaseFromToken()
    public async GetAllAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._service.GetAllAsync(params));
    }



    
    @GET("getById")  
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery()id : number) : Promise<ActionResult>
    { 
       let job = await this._service.GetByIdAsync(id);

       if(!job)
            return this.NotFound({Message : "Job role not found"});        
       
        delete (job as any).Employers;

       return this.OK(job);
    }          


    
    @POST("insert")     
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody()jobRole : JobRole) : Promise<ActionResult>
    {  
        return this.Created(await this._service.AddAsync(jobRole));
    }


    
    @PUT("update")       
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody()jobRole : JobRole) : Promise<ActionResult>
    {  
        return this.OK(await this._service.UpdateAsync(jobRole));        
    }




    @DELETE("delete")     
    @SetDatabaseFromToken()    
    public async DeleteAsync(@FromQuery()id : number) : Promise<ActionResult>
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "Job role not found"});

        return this.OK(await this._service.DeleteAsync(del));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<JobRole>(JobRole));
    }

    
}




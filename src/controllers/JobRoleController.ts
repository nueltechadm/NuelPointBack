
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import JobRole from "../core/entities/JobRole";
import {IsLogged} from '../filters/AuthFilter';
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Authorization from "../utils/Authorization";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";

@UseBefore(IsLogged)
@Validate()
export default class JobRoleController extends AbstractController
{   
    @Inject()
    private _jobRoleService : AbstractJobRoleService;

    @Inject()
    private _userService : AbstractUserService;

    @Inject()
    private _companyService : AbstractCompanyService;
    

    constructor(
        jobRoleService : AbstractJobRoleService, 
        userService : AbstractUserService,
        companyService : AbstractCompanyService
        )
    {
        super();                    
        this._jobRoleService = jobRoleService;
        this._userService = userService;
        this._companyService = companyService;
    }    
    

    @POST("list")     
    @SetDatabaseFromToken()
    public async GetAllAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._jobRoleService.GetAllAsync(params));
    }



    
    @GET("getById")  
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery()id : number) : Promise<ActionResult>
    { 
       let job = await this._jobRoleService.GetByIdAsync(id);

       if(!job)
            return this.NotFound({Message : "Job role not found"});        
       
        delete (job as any).Employers;

       return this.OK(job);
    }          


    
    @POST("insert")     
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody()jobRole : JobRole) : Promise<ActionResult>
    {  
        return this.Created(await this._jobRoleService.AddAsync(jobRole));
    }

   

    @PUT("add/user")       
    @SetDatabaseFromToken()
    public async AddUserAsync(@FromQuery()jobRoleId : number, @FromQuery()userId : number) : Promise<ActionResult>
    {  
        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", jobRoleId, ["Users"])).FirstOrDefault();

        if(!job)
             return this.NotFound({Message : "Jobrole not found"}); 

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : "User not found"}); 
                         
        job.Users.RemoveAll(s => s.Id == userId);

        job.Users.Add(user);

        await this._jobRoleService.UpdateAsync(job);

        return this.OK({Message : `Jobrole updated`});

    }



    @PUT("remove/user")       
    @SetDatabaseFromToken()
    public async RemoveUserAsync(@FromQuery()jobRoleId : number, @FromQuery()userId : number) : Promise<ActionResult>
    {  
        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", jobRoleId, ["Users"])).FirstOrDefault();

        if(!job)
             return this.NotFound({Message : "Jobrole not found"}); 

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : "User not found"}); 
        
        user.JobRole = undefined;
        
        job.Users.RemoveAll(s => s.Id == userId);        

        await this._jobRoleService.UpdateAsync(job);   
        
        await this._userService.UpdateAsync(user);

        return this.OK({Message : `Jobrole updated`});

    }

    
    @PUT("update")       
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody()jobRole : JobRole) : Promise<ActionResult>
    {  
        return this.OK(await this._jobRoleService.UpdateAsync(jobRole));        
    }

    @DELETE("delete")     
    @SetDatabaseFromToken()    
    public async DeleteAsync(@FromQuery()id : number) : Promise<ActionResult>
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = (await this._jobRoleService.GetByAndLoadAsync("Id",id, [])).FirstOrDefault();

        if(!del)
            return this.NotFound({Message : "Job role not found"});

        return this.OK(await this._jobRoleService.DeleteAsync(del));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<JobRole>(JobRole));
    }

    
}





import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import AbstractJobRoleService, { JobRolePaginatedFilteRequest } from "@contracts/AbstractJobRoleService";
import JobRole from "@entities/JobRole";
import {IsLogged} from '@filters/AuthFilter';
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import Authorization from "@utils/Authorization";
import { PaginatedFilterRequest } from "@contracts/AbstractService";
import AbstractUserService from "@contracts/AbstractUserService";
import AbstractCompanyService from "@contracts/AbstractCompanyService";
import JobRoleDTO from "../dto/JobRoleDTO";
import AbstractDepartamentService from "@contracts/AbstractDepartamentService";
import Departament from "@entities/Departament";

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


    @Inject()
    private _departamentService : AbstractDepartamentService;
    

    constructor(
        jobRoleService : AbstractJobRoleService, 
        userService : AbstractUserService,
        companyService : AbstractCompanyService, 
        departamentService : AbstractDepartamentService    
        )
    {
        super();                    
        this._jobRoleService = jobRoleService;
        this._userService = userService;
        this._companyService = companyService;
        this._departamentService = departamentService;
    }    
    

    @POST("list")     
    @SetDatabaseFromToken()
    public async PaginatedFilterAsync(@FromBody()params : JobRolePaginatedFilteRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._jobRoleService.PaginatedFilterAsync(params));
    }


    @GET("all")
    @SetDatabaseFromToken()
    public async GetAllAync() :Promise<ActionResult>
    {
        return this.OK(await this._jobRoleService.GetAllAsync());
    }


    
    @GET("getById")  
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery()id : number) : Promise<ActionResult>
    { 
       let job = (await this._jobRoleService.GetByAndLoadAsync("Id", id, ["Departament"])).FirstOrDefault();

       if(!job)
            return this.NotFound({Message : "Job role not found"});

       return this.OK(job);
    }          


    
    @POST("insert")     
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody()dto : JobRoleDTO) : Promise<ActionResult>
    { 
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", dto.DepartamentId, [])).FirstOrDefault();

        if(!departament)
            return this.NotFound(`Departament with Id ${dto.DepartamentId}`);

        let jobrole = new JobRole(dto.Description, departament);

        await this._jobRoleService.AddAsync(jobrole);

        return this.OK({Message : 'JobRole created', Id : jobrole.Id});
    }

    
    @POST("update")     
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody()dto : JobRoleDTO) : Promise<ActionResult>
    {
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", dto.DepartamentId, [])).FirstOrDefault();

        if(!departament)
            return this.NotFound(`Departament with Id ${dto.DepartamentId}`);

        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", dto.Id, ["Departament"])).FirstOrDefault();

        if(!job)
            return this.NotFound(`JobRole with Id ${dto.Id}`);

        job.Description = dto.Description;
        job.Departament = departament;

        await this._jobRoleService.UpdateObjectAndRelationsAsync(job, ["Departament"]);

        return this.OK({Message : 'JobRole updated'});
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




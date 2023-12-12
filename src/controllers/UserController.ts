
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ProducesResponse, ActionResult } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import User from "../core/entities/User";
import {IsLogged} from '../filters/AuthFilter';
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Journey from "../core/entities/Journey";
import AbstractJorneyService from "../core/abstractions/AbstractJorneyService";
import Company from "../core/entities/Company";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import JobRole from "../core/entities/JobRole";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";
import AbstractAccessService from "../core/abstractions/AbstractAccessService";
import Contact from "../core/entities/Contact";

@UseBefore(IsLogged)
@Validate()
export default class UserController extends AbstractController
{   
    @Inject()
    private _userService : AbstractUserService;

    @Inject()
    private _journeyService : AbstractJorneyService;

    @Inject()
    private _companyService : AbstractCompanyService;

    @Inject()
    private _jobRoleService : AbstractJobRoleService;

    @Inject()
    private _accessService : AbstractAccessService;

    constructor(
            userService    : AbstractUserService, 
            journeyService : AbstractJorneyService, 
            companyService : AbstractCompanyService, 
            jobRoleService : AbstractJobRoleService,
            accessService : AbstractAccessService
        )
    {
        super();                    
        this._userService = userService;
        this._journeyService = journeyService;
        this._companyService = companyService;
        this._jobRoleService = jobRoleService;
        this._accessService = accessService;
    }    


    
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._userService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._companyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._jobRoleService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._journeyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }


    

    @POST("list")
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description : "List of all user of this database", JSON : JSON.stringify([Type.CreateInstance(User)], null, 2)}) 
    public async GetAllAsync(@FromBody()params : PaginatedFilterRequest) : Promise<ActionResult>
    {       
       let paginatedResult =  await this._userService.GetAllAsync(params);

       paginatedResult.Result.forEach(s => this.RemovePassword(s));

       return this.OK(paginatedResult);
    }    




    
    @GET("getById")   
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200,  "A completed loaded user", User)
    @UserController.ProducesMessage(400, "Invalid userId", {Message : "Invalid userId"}) 
    public async GetByIdAsync(@FromQuery()id : number) : Promise<ActionResult>
    { 
        if(!id || typeof id != "number")
            return this.BadRequest({Message : "Invalid userId"});

       let users = await this._userService.GetByAndLoadAsync("Id", id, ["Access", "Contacts", "JobRole", "Journey"]);

       if(users.length == 0)
            return this.NotFound();
        else
            return this.OK(this.RemovePassword(users[0]));
    }       
    
    

    
    @POST("insert")
    @SetDatabaseFromToken()
    @UserController.ProducesType(200, "The just created user", User) 
    public async InsertAsync(@FromBody()user : User) : Promise<ActionResult>
    {         
        return this.OK(await this._userService.AddAsync(user));
    }


    @PUT("contact")  
    @SetDatabaseFromToken()       
    public async UpdateContact(@FromQuery()userId : number, @FromBody()contact : Contact) : Promise<ActionResult>
    {        
        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["Contacts"]);

        if(!users.Any())
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        users.First().Contacts.RemoveAll(s => s.Id == contact.Id);        

        users.First().Contacts.Add(contact);       

        await this._userService.UpdateAsync(users.First());

        return this.OK('User´s contacts updated');
    }

    
    
    @PUT("access")  
    @SetDatabaseFromToken()       
    public async UpdateAccess(@FromQuery()userId : number, @FromQuery()accessId : number) : Promise<ActionResult>
    {
        
        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["Access"]);

        if(!users.Any())
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let accesses = await this._accessService.GetByAndLoadAsync("Id", accessId, []);

        if(!accesses.Any())
            return this.NotFound({Message : `Access with Id ${accessId} not exists`});

        users.First().Access = accesses.First();       

        await this._userService.UpdateAsync(users.First());

        return this.OK('User´s access updated');
    }


    
    @PUT("journey")  
    @SetDatabaseFromToken()       
    public async UpdateJouney(@FromQuery()userId : number, @FromQuery()journeyId : number) : Promise<ActionResult>
    {
        
        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["Journey"]);

        if(!users.Any())
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let journeis = await this._journeyService.GetByAndLoadAsync("Id", journeyId, []);

        if(!journeis.Any())
            return this.NotFound({Message : `Journey with Id ${journeyId} not exists`});

        users.First().Journey = journeis.First();       

        await this._userService.UpdateAsync(users.First());

        return this.OK('User´s journey updated');
    }




    
    @PUT("company")  
    @SetDatabaseFromToken()       
    public async UpdateCompany(@FromQuery()userId : number, @FromQuery()companyId : number) : Promise<ActionResult>
    {
        
        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["Company"]);

        if(!users.Any())
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let companies = await this._companyService.GetByAndLoadAsync("Id", companyId, []);

        if(!companies.Any())
            return this.NotFound({Message : `Company with Id ${companyId} not exists`});

        users.First().Company = companies.First();       

        await this._userService.UpdateAsync(users.First());

        return this.OK('User´s company updated');
    }




    @PUT("jobRole")  
    @SetDatabaseFromToken()       
    public async UpdatejobRole(@FromQuery()userId : number, @FromQuery()jobRoleId : number) : Promise<ActionResult>
    {
        
        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"]);

        if(!users.Any())
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let jobs = await this._jobRoleService.GetByAndLoadAsync("Id", jobRoleId, []);

        if(!jobs.Any())
            return this.NotFound({Message : `JobRole with Id ${jobRoleId} not exists`});

        users.First().JobRole = jobs.First();       

        await this._userService.UpdateAsync(users.First());

        return this.OK('User´s job updated');
    }
    
    

    
    @PUT("update")  
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "The just updated user", User)   
    @UserController.ProducesMessage(400, "A message telling what is missing", {Message : "The ID must be greater than 0"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "User not found"})  
    public async UpdateAsync(@FromBody()user : User) : Promise<ActionResult>
    {        
        if(user.Id == undefined || user.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = await this._userService.GetByIdAsync(user.Id);

        if(!update)
            return this.NotFound({Message : "User not found"});

        return this.OK(await this._userService.UpdateAsync(user));
    }



    @DELETE("delete")   
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "The just deleted user", User)   
    @UserController.ProducesMessage(400, "A message telling what is missing", {Message : "The ID must be greater than 0"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "User not found"}) 
    public async DeleteAsync(@FromQuery()id : number) : Promise<ActionResult>
    {  
        if(!id)
            return this.BadRequest({ Message : "The Id must be greater than 0"});

        let del = await this._userService.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "User not found"});

        return this.OK(await this._userService.DeleteAsync(del));
    }


    
    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson() : Promise<ActionResult>
    {
        return Promise.resolve(this.OK(Type.CreateTemplateFrom<User>(User)));
    }

    private RemovePassword(user? : User) : User | undefined
    {
        if(!user)
            return undefined;

        if(user.Access)
            delete (user.Access as any).Password;        

        return user;
    }

    
}




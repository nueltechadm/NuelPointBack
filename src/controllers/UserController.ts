
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ProducesResponse } from "web_api_base";
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

    constructor(
            userService    : AbstractUserService, 
            journeyService : AbstractJorneyService, 
            companyService : AbstractCompanyService, 
            jobRoleService : AbstractJobRoleService
        )
    {
        super();                    
        this._userService = userService;
        this._journeyService = journeyService;
        this._companyService = companyService;
        this._jobRoleService = jobRoleService;
    }    
    
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._userService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._companyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._jobRoleService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._journeyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }

    @GET("list")
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description : "List of all user of this database", JSON : JSON.stringify([Type.CreateInstance(User)], null, 2)}) 
    public async GetAllAsync() : Promise<void>
    {       
       let users =  await this._userService.GetAllAsync();

       users.forEach(s => this.RemovePassword(s));

       this.OK(users);
    }    
    
    @GET("getById")   
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200,  "A completed loaded user", User)
    @UserController.ProducesMessage(400, "Invalid userId", {Message : "Invalid userId"}) 
    public async GetByIdAsync(@FromQuery()id : number) : Promise<any>
    { 
        if(!id || typeof id != "number")
            return this.BadRequest({Message : "Invalid userId"});

       let users = await this._userService.GetByAndLoadAsync("Id", id, ["Access", "Contacts", "JobRole", "Journey"]);

       if(users.length == 0)
            this.NotFound();
        else
            this.OK(this.RemovePassword(users[0]));
    }          
    
    @POST("insert")
    @SetDatabaseFromToken()
    @UserController.ProducesType(200, "The just created user", User) 
    public async InsertAsync(@FromBody()user : User) : Promise<void>
    {  
        this.OK(await this._userService.AddAsync(user));
    }

    @PUT("journey")  
    @SetDatabaseFromToken()   
    @UserController.ProducesType(200, "The user´s journey", Journey)  
    @UserController.ProducesMessage(400, "Invalid userId", {Message : "Invalid userId"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "The user with ID 1 not exists"})
    public async UpdateJourney(@FromQuery()userId : number, @FromBody()journey : Journey) 
    {
        if(!userId || typeof userId != "number")
            return this.BadRequest({Message : "Invalid userId"});

        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["Journey"]);

        if(users.length == 0)
            return this.NotFound({Message : `User with ID ${userId} not exists`});

        if(journey.Id <= 0)
            this._journeyService.ValidateObject(journey);
        else            
        {
            let journeys = await this._journeyService.GetByAndLoadAsync("Id", journey.Id, []);

            if(journeys.length == 0)
                return this.NotFound({Message : `journey with ID ${journey.Id} not exists`});

            journey = journeys[0];
        }

        users[0].Journey = journey;

        await this._userService.UpdateAsync(users[0]);

        this.OK(journey);
    }

    
    @PUT("company")  
    @SetDatabaseFromToken()    
    @UserController.ProducesType(200, "The user´s company", Company) 
    @UserController.ProducesMessage(400, "Invalid userId", {Message : "Invalid userId"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "The user with ID 1 not exists"})
    public async UpdateCompany(@FromQuery()userId : number, @FromBody()company : Company) 
    {
        if(!userId || typeof userId != "number")
            return this.BadRequest({Message : "Invalid userId"});

        let users = await this._userService.GetByAndLoadAsync("Id", userId, ["Company"]);

        if(users.length == 0)
            return this.NotFound({Message : `User with ID ${userId} not exists`});

        if(company.Id <= 0)
            this._companyService.ValidateObject(company);
        else            
        {
            let companies = await this._companyService.GetByAndLoadAsync("Id", company.Id, []);

            if(companies.length == 0)
                return this.NotFound({Message : `Company with ID ${company.Id} not exists`});

            company = companies[0];
        }

        users[0].Company = company;

        await this._userService.UpdateAsync(users[0]);

        this.OK(company);
    }


    @PUT("jobrole")  
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "The user´s jobrole", JobRole)  
    @UserController.ProducesMessage(400, "Invalid userId", {Message : "Invalid userId"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "The user with ID 1 not exists"})   
    public async UpdateJobRole(@FromQuery()userId : number, @FromBody()jobRole : JobRole) 
    {
        if(!userId || typeof userId != "number")
            return this.BadRequest({Message : "Invalid userId"});

        let users = await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"]);

        if(users.length == 0)
            return this.NotFound({Message : `User with ID ${userId} not exists`});

        let user = users[0];

        if(jobRole.Id <= 0)
            this._jobRoleService.ValidateObject(jobRole);
        else            
        {
            let jobRoles = await this._jobRoleService.GetByAndLoadAsync("Id", jobRole.Id, []);

            if(jobRoles.length == 0)
                return this.NotFound({Message : `JobRole with ID ${jobRole.Id} not exists`});

            jobRole = jobRoles[0];
        }

        user.JobRole = jobRole;

        await this._userService.UpdateAsync(user);

        this.OK(jobRole);
    }
    
    
    @PUT("update")  
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "The just updated user", User)   
    @UserController.ProducesMessage(400, "A message telling what is missing", {Message : "The ID must be greater than 0"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "User not found"})  
    public async UpdateAsync(@FromBody()user : User) 
    {        
        if(user.Id == undefined || user.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = await this._userService.GetByIdAsync(user.Id);

        if(!update)
            return this.NotFound({Message : "User not found"});

        this.OK(await this._userService.UpdateAsync(user));
    }

    @DELETE("delete")   
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "The just deleted user", User)   
    @UserController.ProducesMessage(400, "A message telling what is missing", {Message : "The ID must be greater than 0"})
    @UserController.ProducesMessage(404, "A message telling what is missing", {Message : "User not found"}) 
    public async DeleteAsync(@FromQuery()id : number) 
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._userService.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "User not found"});

        this.OK(await this._userService.DeleteAsync(del));
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson()
    {
        this.OK(Type.CreateTemplateFrom<User>(User));
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





import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import User from "../core/entities/User";
import {IsLogged} from '../filters/AuthFilter';
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";

@UseBefore(IsLogged)
@Validate()
export default class UserController extends AbstractController
{   
    @Inject()
    private _service : AbstractUserService;

    constructor(service : AbstractUserService)
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
       let users =  await this._service.GetAllAsync();

       users.forEach(s => this.RemovePassWordAndMetadata(s));

       this.OK(users);
    }    
    
    @GET("getById")   
    @SetDatabaseFromToken() 
    public async GetByIdAsync(@FromQuery()id : number) : Promise<void>
    { 
       let user = await this._service.GetByIdAsync(id);

       if(!user)
            this.NotFound();
        else
            this.OK(this.RemovePassWordAndMetadata(user));
    }          
    
    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody()user : User) : Promise<void>
    {  
        this.OK(await this._service.AddAsync(user));
    }
    
    @PUT("update")  
    @SetDatabaseFromToken() 
    public async UpdateAsync(@FromBody()user : User) 
    {        
        if(user.Id == undefined || user.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = await this._service.GetByIdAsync(user.Id);

        if(!update)
            return this.NotFound({Message : "User not found"});

        this.OK(await this._service.UpdateAsync(user));
    }

    @DELETE("delete")   
    @SetDatabaseFromToken() 
    public async DeleteAsync(@FromQuery()id : number) 
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "User not found"});

        this.OK(await this._service.DeleteAsync(del));
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson()
    {
        this.OK(Type.CreateTemplateFrom<User>(User));
    }

    private RemovePassWordAndMetadata(user? : User) : User | undefined
    {
        if(!user)
            return undefined;

        if(user.Access)
            delete (user.Access as any).Password;        

        return Type.RemoveORMMetadata(user);
    }

    
}




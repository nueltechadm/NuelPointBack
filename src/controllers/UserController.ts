
import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, Use, Validate } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import User from "../core/entities/User";
import {IsLogged} from '../filters/AuthFilter';

@Use(IsLogged)
@Validate()
export default class UserController extends ControllerBase
{   
    @Inject()
    private _service : AbstractUserService;

    constructor(service : AbstractUserService)
    {
        super();                    
        this._service = service;
    }    
    

    @GET("list")
    public async GetAllAsync() : Promise<void>
    {       
       let users =  await this._service.GetAllAsync();

       users.forEach(s => this.RemovePassWordAndMetadata(s));

       this.OK(users);
    }    
    
    @GET("getById")    
    public async GetByIdAsync(@FromQuery()id : number) : Promise<void>
    { 
       this.OK(this.RemovePassWordAndMetadata(await this._service.GetByIdAsync(id)));
    }          
    
    @POST("insert")
    public async InsertAsync(@FromBody()user : User) : Promise<void>
    {  
        this.OK(await this._service.AddAsync(user));
    }
    
    @PUT("update")   
    public async UpdateAsync(@FromBody()user : User) : Promise<void>
    {        
        if(user.Id == undefined || user.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = await this._service.GetByIdAsync(user.Id);

        if(!update)
            return this.NotFound({Message : "User not found"});

        this.OK(await this._service.UpdateAsync(user));
    }

    @DELETE("delete")    
    public async DeleteAsync(@FromQuery()id : number) : Promise<void>
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "User not found"});

        this.OK(await this._service.DeleteAsync(del));
    }

    private RemovePassWordAndMetadata(user? : User) : User | undefined
    {
        if(!user)
            return undefined;

        delete (user as any).Password;
        delete (user as any)._orm_metadata_;
        return user;
    }
}
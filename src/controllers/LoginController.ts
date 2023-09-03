
import { ControllerBase, POST, Inject, FromBody, UseBefore, RunBefore, GET } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import {Generate} from '../utils/JWT';
import { IsLogged } from "../filters/AuthFilter";
import Type from "../utils/Type";
import Authorization from "../utils/Authorization";
import DatabaseException from "../exceptions/DatabaseException";
import AbstractController from "./AbstractController";


export default class LoginController extends AbstractController
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

    @POST("login")
    public async LoginAsync(
        @FromBody("username")username: string, 
        @FromBody("password")password: string, 
        @FromBody("company")company: string, 
        @FromBody("company_id")company_id : string) 
    {
        
        await this._service.SetClientDatabaseAsync(new Authorization(username, company, company_id).GetClientDatabase());
           
        let access =  await this._service.GetByUserNameAndPasswordAsync(username, password);

        if(!access)
           return this.Unauthorized({ Message : "Invalid username or password"});

        delete (access as any).Password;        

        if(!access.User)        
            return this.Unauthorized({ Message : "Invalid access, no one user is referenced"});        

        if(!access.Company)
            return this.Unauthorized({ Message : "Invalid access, no one company is referenced"});        

        let token = Generate(new Authorization(access.Username, access.Company!.Name, access.Company!.Id.toString()), 1);

        this.OK({User : Type.RemoveORMMetadata(access), Token : token});
        
    } 

    
    @GET("validateToken")  
    @RunBefore(IsLogged)  
    public async ValidateTokenAsync() 
    {        
        this.OK({Message : "Token válido"});
    } 
    
   
}
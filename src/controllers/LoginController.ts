
import { POST, Inject, FromBody, RunBefore, GET, ActionResult } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import {Generate} from '../utils/JWT';
import { IsLogged } from "../filters/AuthFilter";
import Type from "../utils/Type";
import Authorization from "../utils/Authorization";
import AbstractController from "./AbstractController";
import AbstractDatabaseService from "../services/abstractions/AbstractDatabaseService";
import { DababaseStatus } from "../core/entities/Database";
import LoginDTO from "../dto/LoginDTO";


export default class LoginController extends AbstractController
{   
    @Inject()
    private _userService : AbstractUserService;

    @Inject()
    private _databaseService : AbstractDatabaseService;


    constructor(userService : AbstractUserService, databaseService: AbstractDatabaseService)
    {
        super();                    
        this._userService = userService;
        this._databaseService = databaseService;
    }    

    
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._userService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }    


    @POST("login")   
    public async LoginAsync(@FromBody()user : LoginDTO) : Promise<ActionResult>
    {   
        let db = await this._databaseService.GetDabaseAsync(user.Link);

        if(!db)
            return this.NotFound();
    
        if(db.Status != DababaseStatus.CREATED)
            return this.Unauthorized({ Message : "Access denied", Database : db});

        await this._userService.SetClientDatabaseAsync(new Authorization(user.Username, user.Link, -1).GetClientDatabase());        
           
        let access =  await this._userService.GetByUserNameAndPasswordAsync(user.Username, user.Password);

        if(!access)
           return this.Unauthorized({ Message : "Invalid username or password"});

        delete (access as any).Password;        

        if(!access.User)        
            return this.Unauthorized({ Message : "Invalid access, no one user is referenced"});  

        let token = Generate(new Authorization(access.Username, user.Link, access.User.Id), 1);

        return this.OK({User : Type.RemoveORMMetadata(access), Token : token});
        
    } 


    
    @GET("validateToken")  
    @RunBefore(IsLogged)  
    public async ValidateTokenAsync() : Promise<ActionResult>
    {        
        return Promise.resolve(this.OK({Message : "Token válido"}));
    } 
    
   
}


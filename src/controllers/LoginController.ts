
import { ControllerBase, POST, Inject, FromBody } from "web_api_base";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import {Generate} from '../utils/JWT';


export default class LoginController extends ControllerBase
{   
    @Inject()
    private _service : AbstractUserService;

    constructor(service : AbstractUserService)
    {
        super();                    
        this._service = service;
    }    
    

    @POST("login")
    public async LoginAsync(@FromBody("username")username: string, @FromBody("password")password: string ) : Promise<void>
    {        
        let user =  await this._service.GetByUserNameAndPasswordAsync(username, password);

        if(!user)
           return this.Unauthorized({ Message : "Invalid username or password"});

        delete (user as any).Password;
        delete (user as any)._orm_metadata_;

        let token = Generate({ User : user?.Name}, 1);

        this.OK({User : user, Token : token});
    
    } 
    
   
}
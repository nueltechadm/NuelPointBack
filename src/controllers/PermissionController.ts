
import { RunBefore, GET, Inject, UseBefore, Validate } from "web_api_base";
import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import {IsLogged} from '../filters/AuthFilter';
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";

@UseBefore(IsLogged)
@Validate()
export default class PermissionController extends AbstractController
{   
    @Inject()
    private _service : AbstractPermissionService;

    constructor(service : AbstractPermissionService)
    {
        super();                    
        this._service = service;
    }        

    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._service.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }

    @GET("list")
    @RunBefore(IsLogged)     
    public async GetAllAsync() : Promise<void>
    {
       this.OK(await this._service.GetAllAsync());
    } 
   
}
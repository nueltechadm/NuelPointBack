
import { ControllerBase, GET, Inject, Use, Validate } from "web_api_base";
import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import {IsLogged} from '../filters/AuthFilter';

@Use(IsLogged)
@Validate()
export default class PermissionController extends ControllerBase
{   
    @Inject()
    private _service : AbstractPermissionService;

    constructor(service : AbstractPermissionService)
    {
        super();                    
        this._service = service;
    }        

    @GET("list")
    public async GetAllAsync() : Promise<void>
    {
       this.OK(await this._service.GetAllAsync());
    } 
   
}
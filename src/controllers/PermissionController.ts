
import { GET, Inject, UseBefore, Validate, ActionResult, POST, FromBody } from "web_api_base";
import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import {IsLogged} from '../filters/AuthFilter';
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Permission from "../core/entities/Permission";
import Type from "../utils/Type";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";

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



    @POST("list")     
    @SetDatabaseFromToken()
    public async GetAllAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._service.GetAllAsync(params));
    }


    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Permission>(Permission));
    }
   
}
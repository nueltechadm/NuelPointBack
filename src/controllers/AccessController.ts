import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RunBefore, ProducesResponse, OKResult, ActionResult } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import Type from "../utils/Type";
import  AbstractAccessService  from "../core/abstractions/AbstractAccessService";
import Access from "../core/entities/Access";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";


@UseBefore(IsLogged)
@Validate()
export class AccessController extends AbstractController {
    
    @Inject()
    private _accessService: AbstractAccessService;

    @Inject()
    private _companyService: AbstractCompanyService;


    constructor(accessService: AbstractAccessService, companyService : AbstractCompanyService) {

        super();
        this._accessService = accessService;
        this._companyService = companyService;
    }


    
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._accessService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._companyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }



    @POST("list")    
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description: "List of accesses with no one related object", JSON: JSON.stringify(Type.CreateInstance(Access), null, 2)})
    public async GetAllAsync(@FromBody()paginatedRequest : PaginatedFilterRequest): Promise<ActionResult> {

        let paginatedResult = await this._accessService.GetAllAsync(paginatedRequest);

        paginatedResult.Result.forEach(s => this.RemovePassWordAndMetadata(s));

        return this.OK(paginatedResult);
    }



    @GET("getById")    
    @SetDatabaseFromToken()
    @AccessController.ProducesType(200, "A complete loaded access object", Access)
    @AbstractController.ProducesMessage(404, "A message telling what is missing", {Message : "Access with ID 1 not exists"})
    public async GetByIdAsync(@FromQuery() id: number): Promise<ActionResult> {
        let access = await this._accessService.GetByIdAsync(id);

        if (!access)
            return this.NotFound(`Access with ID ${id} not exists`);

        return this.OK(this.RemovePassWordAndMetadata(access!));
    }



    @GET("getByCompanyId")    
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description: "List of accesses with no one related object", JSON: JSON.stringify([Type.CreateInstance(Access)], null, 2)})
    @AbstractController.ProducesMessage(404, "A message telling what is missing", {Message : "Access with ID 1 not exists"})
    public async GetByCompanyIdAsync(@FromQuery() id: number): Promise<ActionResult> {

        let company = await this._companyService.GetByIdAsync(id);

        if (!company)
            return this.NotFound(`Company with ID ${id} not exists`);

        company?.Accesses.forEach(a => this.RemovePassWordAndMetadata(a));    

        return this.OK(company?.Accesses);
    }



    @POST("insert")    
    @SetDatabaseFromToken()
    @AccessController.ProducesType(200, "Returns the just created access object" ,Access)
    @AbstractController.ProducesMessage(400, "A message telling what is wrong", {Message : "The username of Access is required"})
    public async InsertAsync(@FromBody() access: Access): Promise<ActionResult> {
        return this.Created(await this._accessService.AddAsync(access));
    }



    @PUT("update")    
    @SetDatabaseFromToken()
    @AccessController.ProducesType(200, "Returns the just created access object" ,Access)
    @AbstractController.ProducesMessage(400, "A message telling what is wrong", {Message : "The username of Access is required"})
    public async UpdateAsync(@FromBody() access: Access) : Promise<ActionResult>
    {

        if (access.Id == undefined || access.Id <= 0)
            return this.BadRequest({ Message: "The Id must be greater than 0" });

        let update = await this._accessService.GetByIdAsync(access.Id);

        if (!update)
            return this.NotFound({ Message: "Access not found" });

       return this.OK(await this._accessService.UpdateAsync(access));
    }



    @DELETE("delete")    
    @SetDatabaseFromToken()
    @AccessController.ProducesType(200, "Returns the just deleted access object" ,Access)
    @AbstractController.ProducesMessage(400, "A message telling what is wrong", {Message : "The ID must be greater than 0"})
    @AbstractController.ProducesMessage(404, "A message telling what is wrong", {Message : "The Access with ID 1 not exists"})
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._accessService.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Access not found" });

        return this.OK(await this._accessService.DeleteAsync(del));
    }



    
    @GET("getJson")    
    @AccessController.ProducesType(200, "Returns a sample of access object", Access)
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Access>(Access));
    }




    private RemovePassWordAndMetadata(access?: Access): Access | undefined {
        if (!access)
            return undefined;

        delete (access as any).Password;

        return Type.RemoveFieldsRecursive(access);
    }

}



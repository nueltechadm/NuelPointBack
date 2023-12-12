import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractDepartamentService from "../core/abstractions/AbstractDepartamentService";
import Departament from "../core/entities/Departament";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";

@UseBefore(IsLogged)
@Validate()
export default class DepartamentController extends AbstractController {
    
    @Inject()
    private _departamentService: AbstractDepartamentService;

    @Inject()
    private _companyService: AbstractCompanyService;


    constructor(departamentService: AbstractDepartamentService, companyService : AbstractCompanyService) {
        super();
        this._departamentService = departamentService;
        this._companyService = companyService;
    }

    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._departamentService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._companyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }




    @POST("list")     
    @SetDatabaseFromToken()
    public async GetAllAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._departamentService.GetAllAsync(params));
    }



    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {        
        let departament = await this._departamentService.GetByIdAsync(id);

        if (!departament)
            return this.NotFound({ Message: "departament not found" });

        return this.OK(Type.RemoveFieldsRecursive(departament));
    }



    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {
        return this.OK(await this._departamentService.AddAsync(departament));
    }



    @POST("add-to-all")
    @SetDatabaseFromToken()
    public async AddToAllAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {
        
        if(departament.Id <= 0)
            return this.NotFound("Departament not exists in database");   
        
        return this.NotFound();

    }



    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {        
        return this.OK(await this._departamentService.UpdateAsync(departament));
    }



    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._departamentService.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "departament not found" });

        return this.OK(await this._departamentService.DeleteAsync(del));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Departament>(Departament));
    }


}



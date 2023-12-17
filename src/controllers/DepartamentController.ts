import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
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
        let fromDB = await this._departamentService.GetByAndLoadAsync("Name", departament.Name.Trim(), []);

        if(fromDB.Any(s => s.Id != departament.Id))
            return this.BadRequest(`Departament ${departament.Name} already exists on database`);

        await this._departamentService.AddAsync(departament);

        return this.OK({Message : 'Departament added', id : departament.Id});
    }


    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {   
        let exists = await this._departamentService.GetByAndLoadAsync("Id", departament.Id, []);

        if(!exists.Any())
            return this.NotFound(`Departament ${departament.Name} not exists on database`);     

        let fromDB = await this._departamentService.GetByAndLoadAsync("Name", departament.Name.Trim(), []);

        if(fromDB.Any(s => s.Id != departament.Id))
            return this.BadRequest(`Departament ${departament.Name} already exists on database`);

        await this._departamentService.UpdateAsync(departament);

        return this.OK({Message : 'Departament updated'});
    }



    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let exists = await this._departamentService.GetByAndLoadAsync("Id", id, []);

        if(!exists.Any())
            return this.NotFound({ Message: "departament not found" });

        return this.OK(await this._departamentService.DeleteAsync(exists.First()));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Departament>(Departament));
    }


}



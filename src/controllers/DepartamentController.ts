import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, RequestJson, ProducesResponse } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractDepartamentService, { DepartamentPaginatedRequest } from "@contracts/AbstractDepartamentService";
import Departament from "@entities/Departament";
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "@utils/Authorization";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import AbstractCompanyService from "@contracts/AbstractCompanyService";
import { PaginatedFilterRequest, PaginatedFilterResult } from "@contracts/AbstractService";
import JobRole from "@entities/JobRole";

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
    @DepartamentController.ProducesType(200, "A page of departaments", PaginatedFilterResult<Departament>)
    public async PaginatedFilterAsync(@FromBody()params : DepartamentPaginatedRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._departamentService.PaginatedFilterAsync(params));
    }

    @GET("all")     
    @SetDatabaseFromToken()
    @ProducesResponse({ Status: 200, Description: "All departaments without jobroles relateds", JSON: JSON.stringify([Type.CreateTemplateFrom(Departament, false, ["JobRoles"])], null, 2)})
    public async GetAllAsync(): Promise<ActionResult> 
    {             
        return this.OK((await this._departamentService.GetAllAsync()).Select(s => Type.Delete(s, "JobRoles")));
    }

    @GET("getById")
    @SetDatabaseFromToken()
    @DepartamentController.ProducesType(200, "The departament", Departament)
    @DepartamentController.ProducesMessage(404, "The departament", { Message: "departament not found" })
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {        
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", id, ["JobRoles"])).FirstOrDefault();

        if (!departament)
            return this.NotFound({ Message: "departament not found" });

        return this.OK(Type.RemoveFieldsRecursive(departament));
    }



    @POST("insert")
    @SetDatabaseFromToken()  
    @RequestJson(JSON.stringify(Type.CreateTemplateFrom<Departament>(Departament, false, ["JobRoles"]), null, 2))  
    public async InsertAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {
        let fromDB = await this._departamentService.GetByAndLoadAsync("Description", departament.Description.Trim(), []);

        if(fromDB.Any(s => s.Id != departament.Id))
            return this.BadRequest(`Departament ${departament.Description} already exists on database`);

        await this._departamentService.AddAsync(departament);

        return this.OK({Message : 'Departament added', id : departament.Id});
    }


    @PUT("update")
    @SetDatabaseFromToken()
    @RequestJson(JSON.stringify(Type.CreateTemplateFrom<Departament>(Departament, false, ["JobRoles"]), null, 2))  
    public async UpdateAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {   
        let exists = await this._departamentService.GetByAndLoadAsync("Id", departament.Id, []);

        if(!exists.Any())
            return this.NotFound(`Departament ${departament.Description} not exists on database`);     

        let fromDB = await this._departamentService.GetByAndLoadAsync("Description", departament.Description.Trim(), []);

        if(fromDB.Any(s => s.Id != departament.Id))
            return this.BadRequest(`Departament ${departament.Description} already exists on database`);

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
        return this.OK(Type.CreateTemplateFrom<Departament>(Departament, false, ["JobRoles"]));
       
    }

    


}



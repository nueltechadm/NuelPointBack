import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, RequestJson, ProducesResponse, Description } from "web_api_base";
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
    @DepartamentController.ProducesType(200, "Uma página de departamentos", PaginatedFilterResult<Departament>)
    @Description(`Utilize esse metodo para visualizar uma lista de departamentos recuperados pelo filtro`)  
    public async PaginatedFilterAsync(@FromBody()params : DepartamentPaginatedRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._departamentService.PaginatedFilterAsync(params));
    }

    @GET("all")     
    @SetDatabaseFromToken()
    @ProducesResponse({ Status: 200, Description: "Todos os departamentos sem cargos relacionados", JSON: JSON.stringify([Type.CreateTemplateFrom(Departament, false, ["JobRoles"])], null, 2)})
    @Description(`Utilize esse metodo para visualizar todos os departamentos registrados no banco de dados`) 
    public async GetAllAsync(): Promise<ActionResult> 
    {             
        return this.OK((await this._departamentService.GetAllAsync()).Select(s => Type.Delete(s, "JobRoles")));
    }

    @GET("getById")
    @SetDatabaseFromToken()
    @DepartamentController.ProducesType(200, "O departamento", Departament)
    @DepartamentController.ProducesMessage(404, "O departamento", { Message: "Departamento não encontrado" })
    @Description(`Utilize esse metodo para visualizar um departamento especifico pelo Id`) 
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {        
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", id, ["JobRoles"])).FirstOrDefault();

        if (!departament)
            return this.NotFound({ Message: "Departamento não encontrado" });

        return this.OK(Type.RemoveFieldsRecursive(departament));
    }



    @POST("insert")
    @SetDatabaseFromToken()  
    @DepartamentController.ProducesType(200, "Departamento adicionado", Departament)
    @DepartamentController.ProducesMessage(404, "O departamento ", { Message: "Departamento já existe no banco de dados" })
    @Description(`Utilize esse metodo para um departamento ao banco de dados`) 
    @RequestJson(JSON.stringify(Type.CreateTemplateFrom<Departament>(Departament, false, ["JobRoles"]), null, 2))  
    public async InsertAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {
        let fromDB = await this._departamentService.GetByAndLoadAsync("Description", departament.Description.Trim(), []);

        if(fromDB.Any(s => s.Id != departament.Id))
            return this.BadRequest(`Departamento ${departament.Description} já existe no banco de dados`);

        await this._departamentService.AddAsync(departament);

        return this.OK({Message : 'Departamento adicionado', id : departament.Id});
    }


    @PUT("update")
    @SetDatabaseFromToken()
    @DepartamentController.ProducesMessage(200, 'Mensagem de sucesso', {Message : 'Departamento atualizado'})
    @DepartamentController.ProducesMessage(400, 'Mensagem de erro', {Message : 'Mensagem descrevendo o erro'})  
    @DepartamentController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Departamento não encontrada'})
    @Description(`Utilize esse metodo para atualizar um departamento do banco de dados`) 
    @RequestJson(JSON.stringify(Type.CreateTemplateFrom<Departament>(Departament, false, ["JobRoles"]), null, 2))  
    public async UpdateAsync(@FromBody() departament: Departament) : Promise<ActionResult>
    {   
        let exists = await this._departamentService.GetByAndLoadAsync("Id", departament.Id, []);

        if(!exists.Any())
            return this.NotFound(`Departamento ${departament.Description} não existe no banco de dados`);     

        let fromDB = await this._departamentService.GetByAndLoadAsync("Description", departament.Description.Trim(), []);

        if(fromDB.Any(s => s.Id != departament.Id))
            return this.BadRequest(`Departamento ${departament.Description} já existe no banco de dados`);

        await this._departamentService.UpdateAsync(departament);

        return this.OK({Message : 'Departamento atualizado'});
    }



    @DELETE("delete")
    @DepartamentController.ProducesMessage(200, 'Mensagem de sucesso', {Message : 'Departamento deletado'})
    @DepartamentController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Departamento não encontrado'})
    @Description(`Utilize esse metodo para deletar um departamento do banco de dados`) 
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let exists = await this._departamentService.GetByAndLoadAsync("Id", id, []);

        if(!exists.Any())
            return this.NotFound({ Message: "Departamento não encontrado" });

        return this.OK(await this._departamentService.DeleteAsync(exists.First()));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Departament>(Departament, false, ["JobRoles"]));
       
    }

    


}



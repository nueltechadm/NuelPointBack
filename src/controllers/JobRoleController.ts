
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, Description } from "web_api_base";
import AbstractJobRoleService, { JobRolePaginatedFilteRequest } from "@contracts/AbstractJobRoleService";
import JobRole from "@entities/JobRole";
import { IsLogged } from '@filters/AuthFilter';
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import Authorization from "@utils/Authorization";
import { PaginatedFilterRequest } from "@contracts/AbstractService";
import AbstractUserService from "@contracts/AbstractUserService";
import AbstractCompanyService from "@contracts/AbstractCompanyService";
import JobRoleDTO from "../dto/JobRoleDTO";
import AbstractDepartamentService from "@contracts/AbstractDepartamentService";
import Departament from "@entities/Departament";

@UseBefore(IsLogged)
@Validate()
export default class JobRoleController extends AbstractController
{
    @Inject()
    private _jobRoleService: AbstractJobRoleService;

    @Inject()
    private _userService: AbstractUserService;

    @Inject()
    private _companyService: AbstractCompanyService;


    @Inject()
    private _departamentService: AbstractDepartamentService;


    constructor(
        jobRoleService: AbstractJobRoleService,
        userService: AbstractUserService,
        companyService: AbstractCompanyService,
        departamentService: AbstractDepartamentService
    )
    {
        super();
        this._jobRoleService = jobRoleService;
        this._userService = userService;
        this._companyService = companyService;
        this._departamentService = departamentService;
    }


    @POST("list")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesType(200, "Uma lista de cargos", JobRole)
    @Description(`Utilize esse metodo para visualizar uma lista de cargos recuperados pelo filtro`)
    public async PaginatedFilterAsync(@FromBody() params: JobRolePaginatedFilteRequest): Promise<ActionResult> 
    {
        return this.OK(await this._jobRoleService.PaginatedFilterAsync(params));
    }


    @GET("all")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesType(200, "Todos cargos registrados no banco de dados", JobRole)
    @Description(`Utilize esse metodo para visualizar uma lista de todos cargos registrados no banco de dados`)
    public async GetAllAync(): Promise<ActionResult>
    {
        return this.OK(await this._jobRoleService.GetAllAsync());
    }



    @GET("getById")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesType(200, "O cargo com o Id fornecido", JobRole)
    @JobRoleController.ProducesMessage(404, 'Mensagem de erro', { Message: "Cargo não encontrado" })
    @Description(`Utilize esse metodo para visualizar um cargo especifica pelo Id`)
    public async GetByIdAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", id, ["Departament"])).FirstOrDefault();

        if (!job)
            return this.NotFound({ Message: "Cargo não encontrado" });

        return this.OK(job);
    }



    @POST("insert")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesMessage(200, 'Mensagem de sucesso', { Message: "Cargo criado", Id: 1 })
    @Description(`Utilize esse metodo para inserir um novo cargo no banco de dados`)
    public async InsertAsync(@FromBody() dto: JobRoleDTO): Promise<ActionResult>
    {
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", dto.DepartamentId, [])).FirstOrDefault();

        if (!departament)
            return this.NotFound(`Departamento com Id ${dto.DepartamentId}`);

        let jobrole = new JobRole(dto.Description, departament);

        await this._jobRoleService.AddAsync(jobrole);

        return this.OK({ Message: 'Cargo criado', Id: jobrole.Id });
    }


    @POST("update")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Cargo atualizado' })
    @JobRoleController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Mensagem descrevendo o erro' })
    @JobRoleController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Cargo não encontrado' })
    @Description(`Utilize esse metodo para atualizar um cargo do banco de dados`)
    public async UpdateAsync(@FromBody() dto: JobRoleDTO): Promise<ActionResult>
    {
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", dto.DepartamentId, [])).FirstOrDefault();

        if (!departament)
            return this.NotFound(`Departamento com Id ${dto.DepartamentId}`);

        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", dto.Id, ["Departament"])).FirstOrDefault();

        if (!job)
            return this.NotFound(`Cargo com Id ${dto.Id}`);

        job.Description = dto.Description;
        job.Departament = departament;

        await this._jobRoleService.UpdateObjectAndRelationsAsync(job, ["Departament"]);

        return this.OK({ Message: 'Cargo atualizado' });
    }



    @PUT("add/user")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Cargo atualizado' })
    @JobRoleController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Cargo não encontrado' })
    @Description(`Utilize esse metodo para adicionar um usuário a um cargo`)
    public async AddUserAsync(@FromQuery() jobRoleId: number, @FromQuery() userId: number): Promise<ActionResult>
    {
        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", jobRoleId, ["Users"])).FirstOrDefault();

        if (!job)
            return this.NotFound({ Message: "Cargo não encontrado" });

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"])).FirstOrDefault();

        if (!user)
            return this.NotFound({ Message: "Usuário não encontrado" });

        job.Users.RemoveAll(s => s.Id == userId);

        job.Users.Add(user);

        await this._jobRoleService.UpdateAsync(job);

        return this.OK({ Message: `Cargo atualizado` });

    }



    @PUT("remove/user")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Cargo atualizado' })
    @JobRoleController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Cargo não encontrado' })
    @Description(`Utilize esse metodo para remover um usuário de um cargo`)
    public async RemoveUserAsync(@FromQuery() jobRoleId: number, @FromQuery() userId: number): Promise<ActionResult>
    {
        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", jobRoleId, ["Users"])).FirstOrDefault();

        if (!job)
            return this.NotFound({ Message: "Cargo não encontrada" });

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"])).FirstOrDefault();

        if (!user)
            return this.NotFound({ Message: "Usuário não encontrado" });

        user.JobRole = undefined;

        job.Users.RemoveAll(s => s.Id == userId);

        await this._jobRoleService.UpdateAsync(job);

        await this._userService.UpdateAsync(user);

        return this.OK({ Message: `Cargo atualizado` });

    }




    @DELETE("delete")
    @SetDatabaseFromToken()
    @JobRoleController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Cargo deletado' })
    @JobRoleController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Cargo não encontrado' })
    @Description(`Utilize esse metodo para remover um cargo do banco de dados`)
    public async DeleteAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        if (!id)
            return this.BadRequest({ Message: "O Id deve ser maior que 0" });

        let del = (await this._jobRoleService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!del)
            return this.NotFound({ Message: "cargo não encontrado" });

        return this.OK(await this._jobRoleService.DeleteAsync(del));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<JobRole>(JobRole));
    }


}




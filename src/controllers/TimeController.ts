import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, RequestJson, Description } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractTimeService, { TimePaginatedFilterRequest } from "@contracts/AbstractTimeService";
import Time from "@entities/Time";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import { PaginatedFilterRequest } from "@contracts/AbstractService";

@UseBefore(IsLogged)
@Validate()
export default class TimeController extends AbstractController
{
    @Inject()
    private _service: AbstractTimeService;


    constructor(service: AbstractTimeService)
    {
        super();
        this._service = service;
    }


    @POST("list")
    @SetDatabaseFromToken()
    @TimeController.ProducesType(200, "Uma lista de horários", Time)
    @Description(`Utilize esse metodo para visualizar uma lista de horários recuperados pelo filtro`)
    public async PaginatedFilterAsync(@FromBody() params: TimePaginatedFilterRequest): Promise<ActionResult> 
    {
        return this.OK(await this._service.PaginatedFilterAsync(params));
    }

    @GET("all")
    @SetDatabaseFromToken()
    @TimeController.ProducesType(200, "Todos horários registrados no banco de dados", Time)
    @Description(`Utilize esse metodo para visualizar uma lista de todos horários registrados no banco de dados`)
    public async GetAllAsync(): Promise<ActionResult> 
    {
        return this.OK((await this._service.GetAllAsync()));
    }

    @GET("getById")
    @TimeController.ProducesType(200, "Os horários com o Id fornecido", Time)
    @TimeController.ProducesMessage(404, 'Mensagem de erro', { Message: "Horário não encontrado" })
    @Description(`Utilize esse metodo para visualizar um horário especifico por Id`)
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let time = await this._service.GetByIdAsync(id);

        if (!time)
            return this.NotFound({ Message: "Horário não encontrada" });

        return this.OK(time);
    }

    @POST("insert")
    @SetDatabaseFromToken()
    @TimeController.ProducesMessage(200, 'Mensagem de sucesso', { Message: "Horário criado", Id: 1 })
    @Description(`Utilize esse metodo para inserir um Horário no banco de dados `)
    @RequestJson(JSON.stringify(new Time("Sample"), null, 2))
    public async InsertAsync(@FromBody() time: Time): Promise<ActionResult>
    {
        let result = await this._service.AddAsync(time);

        return this.OK({ Message: "Horário criado", Id: result.Id });
    }

    @PUT("update")
    @SetDatabaseFromToken()
    @TimeController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Horário atualizada' })
    @TimeController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Mensagem descrevendo o erro' })
    @TimeController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Horário não encontrado' })
    @Description(`Utilize esse metodo para atualizar um Horário no banco de dados `)
    @RequestJson(JSON.stringify(new Time("Sample"), null, 2))
    public async UpdateAsync(@FromBody() time: Time): Promise<ActionResult>
    {
        let exists = await this._service.GetByIdAsync(time.Id);

        if (!exists)
            return this.NotFound({ Message: "Horário não encontrado" });

        Object.assign(exists, time);

        await this._service.UpdateAsync(exists);

        return this.OK({ Message: "Horário atualizado" });
    }

    @DELETE("delete")
    @SetDatabaseFromToken()
    @TimeController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Horário deletado' })
    @TimeController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Horário não encontrado' })
    @Description(`Utilize esse metodo para remover um Horário no banco de dados `)
    public async DeleteAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Horário não encontrado" });

        await this._service.DeleteAsync(del);

        return this.OK({ Message: "Horário deletado" });
    }

    

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): Promise<ActionResult>
    {
        return Promise.resolve(this.OK(new Time("Sample")));
    }


}



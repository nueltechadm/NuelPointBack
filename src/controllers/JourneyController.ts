import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, Description } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import AbstractJourneyService, { JourneyPaginatedFilterRequest } from "@contracts/AbstractJorneyService";
import Journey from "@entities/Journey";
import { PaginatedFilterRequest } from "@contracts/AbstractService";
import JourneyDTO from "@src/dto/JourneyDTO";
import AbstractCompanyService from "@src/core/abstractions/AbstractCompanyService";
import Company from "@src/core/entities/Company";
import AbstractDayOfWeekService from "@src/core/abstractions/AbstractDayOfWeekService";
import DayOfWeek from "@src/core/entities/DayOfWeek";
import AbstractTimeService from "@src/core/abstractions/AbstractTimeService";
import Time from "@src/core/entities/Time";
import AbstractUserService from "@src/core/abstractions/AbstractUserService";


@UseBefore(IsLogged)
@Validate()
export default class JourneyController extends AbstractController
{
    @Inject()
    private _journeyService: AbstractJourneyService;

    @Inject()
    private _dayOfWeekService: AbstractDayOfWeekService;

    @Inject()
    private _userService: AbstractUserService;

    @Inject()
    private _companyService: AbstractCompanyService;

    @Inject()
    private _timeService: AbstractTimeService;

    constructor(
        journeyService: AbstractJourneyService,
        timeService: AbstractTimeService,
        companyService: AbstractCompanyService,
        dayOfWeekService: AbstractDayOfWeekService, 
        userService : AbstractUserService
    ) 
    {
        super();
        this._journeyService = journeyService;
        this._timeService = timeService;
        this._companyService = companyService;
        this._dayOfWeekService = dayOfWeekService;
        this._userService = userService;
    }


    @POST("list")
    @SetDatabaseFromToken()
    @JourneyController.ProducesType(200, "Uma lista de jornadas", Journey)
    @Description(`Utilize esse metodo para visualizar uma lista de jornadas recuperados pelo filtro`)
    public async PaginatedFilterAsync(@FromBody() params: JourneyPaginatedFilterRequest): Promise<ActionResult> 
    {
        return this.OK(await this._journeyService.PaginatedFilterAsync(params));
    }



    @GET("getById")
    @SetDatabaseFromToken()
    @JourneyController.ProducesType(200, "A jornada com o Id fornecido", Journey)
    @JourneyController.ProducesMessage(404, 'Mensagem de erro', { Message: "Jornada não encontrada" })
    @Description(`Utilize esse metodo para visualizar uma jornada especifica pelo Id`)
    public async GetByIdAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let journey = await this._journeyService.GetByIdAsync(id);

        if (!journey)
            return this.NotFound({ Message: `${Journey.name} não encontrada` });

        return this.OK(journey);
    }




    @POST("insert")
    @SetDatabaseFromToken()
    @JourneyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: "Jornada criada", Id: 1 })
    @Description(`Utilize esse metodo para adicionar uma jornada ao banco de dados`)
    public async InsertAsync(@FromBody() dto: JourneyDTO): Promise<ActionResult>
    {

        if (dto.DaysOfWeek.Count() == 0)
            return this.BadRequest(`DaysOfWeek é obrigatório`);

        let company = (await this._companyService.GetByAndLoadAsync("Id", dto.CompanyId, [])).FirstOrDefault();

        if (!company)
            return this.BadRequest(`${Company.name} com Id ${dto.CompanyId} não existe`);
       
        let days: DayOfWeek[] = [];
        let journey = new Journey(dto.Description, company);

        for (let d of dto.DaysOfWeek)
        {
            if (d.DayOff)
            {

                let day = new DayOfWeek(d.Day, d.DayName, journey);

                day.DayOff = true;
                day.Id = -1;

                days.Add(day);


            }
            else
            {

                let time = await this._timeService.GetByIdAsync(d.TimeId);

                if (!time)
                    return this.BadRequest({ Message: `${Time.name} com Id ${d.TimeId} não existe` });

                let day = new DayOfWeek(d.Day, d.DayName, journey, time);

                day.Id = -1;

                days.Add(day);
            }

        }

        journey.DaysOfWeek = days;

        if(dto.UsersIds && dto.UsersIds.Any())
        {
            journey.Users = await this._userService.GetByIdsAsync(dto.UsersIds);
        }

        await this._journeyService.AddAsync(journey);        

        return this.OK({ Message: `Jornada criada com sucesso`, Id: journey.Id });
    }




    @PUT("update")
    @SetDatabaseFromToken()
    @JourneyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Jornada atualizada' })
    @JourneyController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Mensagem descrevendo o erro' })
    @JourneyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Jornada não encontrada' })
    @Description(`Utilize esse metodo para atualizar uma jornada do banco de dados`)
    public async UpdateAsync(@FromBody() dto: JourneyDTO): Promise<ActionResult>
    {
        if (dto.DaysOfWeek.Count() == 0)
            return this.BadRequest(`DaysOfWeek é obrigatório`);

        let exists = (await this._journeyService.GetByAndLoadAsync("Id", dto.Id, ["Company", "DaysOfWeek"])).FirstOrDefault();

        if (!exists)
            return this.BadRequest(`${Journey.name} com Id ${dto.Id} não existe`);

        let company = (await this._companyService.GetByAndLoadAsync("Id", dto.CompanyId, [])).FirstOrDefault();

        if (!company)
            return this.BadRequest(`${Company.name} com Id ${dto.CompanyId} não existe`);

        let days: DayOfWeek[] = [];

        exists.Description = dto.Description;
        exists.Company = company;

        for (let d of dto.DaysOfWeek)
        {
            if (d.DayOff)
            {

                let day = new DayOfWeek(d.Day, d.DayName, exists);

                day.DayOff = true;
                day.Id = -1;

                days.Add(day);


            }
            else
            {

                let time = await this._timeService.GetByIdAsync(d.TimeId);

                if (!time)
                    return this.BadRequest({ Message: `${Time.name} com Id ${d.TimeId} não existe` });

                let day = new DayOfWeek(d.Day, d.DayName, exists, time);

                day.Id = -1;

                days.Add(day);
            }
        }

        exists.DaysOfWeek = days;

        await this._journeyService.UpdateObjectAndRelationsAsync(exists, ["Company", "DaysOfWeek"]);

        return this.OK({ Message: `${Journey.name} atualizada` });
    }



    @DELETE("delete")
    @SetDatabaseFromToken()
    @JourneyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Jornada deletada' })
    @JourneyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Jornada não encontrada' })
    @Description(`Utilize esse metodo para remover uma jornada do banco de dados`)
    public async DeleteAsync(@FromQuery() id: number): Promise<ActionResult>
    {

        let del = (await this._journeyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!del)
            return this.NotFound({ Message: `${Journey.name} não encontrada` });

        await this._journeyService.DeleteAsync(del);

        return this.OK({ Message: `${Journey.name} deletada` });
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson()
    {
        return this.OK(Type.CreateTemplateFrom<Journey>(Journey));
    }


}

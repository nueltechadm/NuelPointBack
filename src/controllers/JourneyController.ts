import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import AbstractJourneyService from "@contracts/AbstractJorneyService";
import Journey from "@entities/Journey";
import { PaginatedFilterRequest } from "@contracts/AbstractService";
import JourneyDTO from "@src/dto/JourneyDTO";
import AbstractCompanyService from "@src/core/abstractions/AbstractCompanyService";
import Company from "@src/core/entities/Company";
import AbstractDayOfWeekService from "@src/core/abstractions/AbstractDayOfWeekService";
import DayOfWeek from "@src/core/entities/DayOfWeek";


@UseBefore(IsLogged)
@Validate()
export default class JourneyController extends AbstractController {
    @Inject()
    private _journeyService: AbstractJourneyService;

    @Inject()
    private _dayOfWeekService: AbstractDayOfWeekService;

    @Inject()
    private _companyService: AbstractCompanyService;

    constructor(
        journeyService: AbstractJourneyService, 
        timeService: AbstractDayOfWeekService,
        companyService: AbstractCompanyService) 
    {
        super();
        this._journeyService = journeyService;
        this._dayOfWeekService = timeService,
        this._companyService = companyService;
    }


    @POST("list")     
    @SetDatabaseFromToken()
    public async PaginatedFilterAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._journeyService.PaginatedFilterAsync(params));
    }



    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) :  Promise<ActionResult>
    {        
        let journey = await this._journeyService.GetByIdAsync(id);

        if (!journey)
            return this.NotFound({ Message: `${Journey.name} not found`});        

        return this.OK(journey);
    }




    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() dto: JourneyDTO) :  Promise<ActionResult>
    {

        if(dto.DaysOfWeekIds.Count() == 0)
            return this.BadRequest(`DaysOfWeekIds is required`);

        let company = (await this._companyService.GetByAndLoadAsync("Id", dto.CompanyId, [])).FirstOrDefault();

        if(!company)
            return this.BadRequest(`${Company.name} with Id ${dto.CompanyId} not exists`);

        let days = await this._dayOfWeekService.GetByIdsAsync(dto.DaysOfWeekIds);

        if(days.Count() == 0)
            return this.BadRequest(`No one ${DayOfWeek.name} has found`);

        let notFound = dto.DaysOfWeekIds.FirstOrDefault(s => !days.Any(d => d.Id == s));
        
        if(notFound)
            return this.BadRequest(`${DayOfWeek.name} with Id ${notFound} not exists`);

        let journey = new Journey(dto.Description, company);
        journey.DaysOfWeek = days;

        let result = await this._journeyService.AddAsync(journey);

        return this.OK({Message : `${Journey.name} created`, Id : result.Id});
    }




    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() dto: JourneyDTO) : Promise<ActionResult>
    {
        if(dto.DaysOfWeekIds.Count() == 0)
            return this.BadRequest(`DaysOfWeekIds is required`);

        let exists = (await this._journeyService.GetByAndLoadAsync("Id",dto.Id, ["Company", "DaysOfWeek"])).FirstOrDefault();

        if(!exists)
            return this.BadRequest(`${Journey.name} with Id ${dto.Id} not exists`);

        let company = (await this._companyService.GetByAndLoadAsync("Id", dto.CompanyId, [])).FirstOrDefault();

        if(!company)
            return this.BadRequest(`${Company.name} with Id ${dto.CompanyId} not exists`);

        let days = await this._dayOfWeekService.GetByIdsAsync(dto.DaysOfWeekIds);

        if(days.Count() == 0)
            return this.BadRequest(`No one ${DayOfWeek.name} has found`);

        let notFound = dto.DaysOfWeekIds.FirstOrDefault(s => !days.Any(d => d.Id == s));
        
        if(notFound)
            return this.BadRequest(`${DayOfWeek.name} with Id ${notFound} not exists`);

        exists.Company = company;
        exists.DaysOfWeek = days;
        exists.Description = dto.Description;

        await this._journeyService.UpdateObjectAndRelationsAsync(exists, ["Company", "DaysOfWeek"]);

        return this.OK({Message : `${Journey.name} updated`});
    }



    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {        

        let del = (await this._journeyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!del)
            return this.NotFound({ Message: `${Journey.name} not found`});

        await this._journeyService.DeleteAsync(del);

        return this.OK({Message: `${Journey.name} deleted`});
    }


    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() {
        return this.OK(Type.CreateTemplateFrom<Journey>(Journey));
    }


}

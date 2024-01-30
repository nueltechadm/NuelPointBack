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
import AbstractTimeService from "@src/core/abstractions/AbstractTimeService";
import Time from "@src/core/entities/Time";


@UseBefore(IsLogged)
@Validate()
export default class JourneyController extends AbstractController {
    @Inject()
    private _journeyService: AbstractJourneyService;

    @Inject()
    private _dayOfWeekService: AbstractDayOfWeekService;

    @Inject()
    private _companyService: AbstractCompanyService;

    @Inject()
    private _timeService: AbstractTimeService;

    constructor(
        journeyService: AbstractJourneyService, 
        timeService: AbstractTimeService,
        companyService: AbstractCompanyService, 
        dayOfWeekService: AbstractDayOfWeekService
        ) 
    {
        super();
        this._journeyService = journeyService;
        this._timeService = timeService,
        this._companyService = companyService;
        this._dayOfWeekService = dayOfWeekService;
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

        if(dto.DaysOfWeek.Count() == 0)
            return this.BadRequest(`DaysOfWeek is required`);

        let company = (await this._companyService.GetByAndLoadAsync("Id", dto.CompanyId, [])).FirstOrDefault();

        if(!company)
            return this.BadRequest(`${Company.name} with Id ${dto.CompanyId} not exists`);    
            
        let days : DayOfWeek[] = [];
        let journey = new Journey(dto.Description, company);

        for(let d of dto.DaysOfWeek)
        {
            let time = await this._timeService.GetByIdAsync(d.TimeId);

            if(!time)
                return this.BadRequest({Message : `${Time.name} with Id ${d.TimeId} not exists`});

            let day =  new DayOfWeek(d.Day, d.DayName, time, journey);
            
            day.Id = -1;

            days.Add(day);
        }

        
        journey.DaysOfWeek = days;

        let result = await this._journeyService.AddAsync(journey);

        return this.OK({Message : `${Journey.name} created`, Id : result.Id});
    }




    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() dto: JourneyDTO) : Promise<ActionResult>
    {
        if(dto.DaysOfWeek.Count() == 0)
            return this.BadRequest(`DaysOfWeek is required`);

        let exists = (await this._journeyService.GetByAndLoadAsync("Id",dto.Id, ["Company", "DaysOfWeek"])).FirstOrDefault();

        if(!exists)
            return this.BadRequest(`${Journey.name} with Id ${dto.Id} not exists`);

        let company = (await this._companyService.GetByAndLoadAsync("Id", dto.CompanyId, [])).FirstOrDefault();

        if(!company)
            return this.BadRequest(`${Company.name} with Id ${dto.CompanyId} not exists`);    
            
        let days : DayOfWeek[] = [];        

        exists.Description = dto.Description;
        exists.Company = company;

        for(let d of dto.DaysOfWeek)
        {
            let time = await this._timeService.GetByIdAsync(d.TimeId);

            if(!time)
                return this.BadRequest({Message : `${Time.name} with Id ${d.TimeId} not exists`});

            let day =  new DayOfWeek(d.Day, d.DayName, time, exists);
            
            if(!(await this._dayOfWeekService.ExistsAsync(d.Id)))
                day.Id = -1;
            else
                day.Id = d.Id;

            days.Add(day);
        }
        
        exists.DaysOfWeek = days;

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

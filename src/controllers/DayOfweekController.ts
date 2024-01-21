import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractDayOfWeekService, { DayOfWeekPaginatedFilterRequest } from "@contracts/AbstractDayOfWeekService";
import DayOfWeek from "@entities/DayOfWeek";
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import DayOfWeekDTO from "@src/dto/DayOfWeekDTO";
import Time from "@src/core/entities/Time";
import AbstractTimeService from "@src/core/abstractions/AbstractTimeService";


@UseBefore(IsLogged)
@Validate()
export default class DayOfWeekController extends AbstractController {
    
    @Inject()
    private _dayOfWeekService: AbstractDayOfWeekService;

    @Inject()
    private _timeService: AbstractTimeService;

    constructor(dayOfWeekService: AbstractDayOfWeekService, timeService: AbstractTimeService) {
        super();
        this._dayOfWeekService = dayOfWeekService;
        this._timeService = timeService;
    }


    @POST("list")     
    @SetDatabaseFromToken()
    public async PaginatedFilterAsync(@FromBody()params : DayOfWeekPaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._dayOfWeekService.PaginatedFilterAsync(params));
    }

    
    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let day = await this._dayOfWeekService.GetByIdAsync(id);

        if (!day)
            return this.NotFound({ Message: "DayOfWeek not found" });

        return this.OK(day);
    }
    

    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() dto: DayOfWeekDTO) : Promise<ActionResult>
    {
        let time = await this._timeService.GetByIdAsync(dto.TimeId);

        if(!time)
            return this.BadRequest({Message : `${Time.name} with Id ${dto.TimeId} not exists`});        

        let day = new DayOfWeek(dto.Day, dto.DayName, time);
        day.DayOff = dto.DayOff;

        let result = await this._dayOfWeekService.AddAsync(day);

        return this.OK({Message : `${DayOfWeek.name} created`, Id : result.Id});
    }

    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() dto: DayOfWeekDTO) : Promise<ActionResult>
    {
        let time = await this._timeService.GetByIdAsync(dto.TimeId);

        if(!time)
            return this.BadRequest({Message : `${Time.name} with Id ${dto.TimeId} not exists`});      
        
        let exists = (await this._dayOfWeekService.GetByAndLoadAsync("Id", dto.Id, ["Time"])).FirstOrDefault();

        if(!exists)
            return this.BadRequest({Message : `${DayOfWeek.name} with Id ${dto.Id} not exists`}); 

        Object.assign(exists, dto);
        exists.Time = time;

        await this._dayOfWeekService.UpdateObjectAndRelationsAsync(exists, ["Time"]);

        return this.OK({Message : `${DayOfWeek.name} updated`});
                
    }

    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let del = (await this._dayOfWeekService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!del)
            return this.NotFound({ Message: `${DayOfWeek.name} not found`});

        await this._dayOfWeekService.DeleteAsync(del)

        return this.OK({ Message: `${DayOfWeek.name} deleted`});
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): Promise<ActionResult>
    {
        return Promise.resolve(this.OK(Type.CreateTemplateFrom<DayOfWeek>(DayOfWeek)));
    }


}



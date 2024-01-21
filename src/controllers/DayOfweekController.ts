import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractDayOfWeekService, { DayOfWeekPaginatedFilterRequest } from "@contracts/AbstractDayOfWeekService";
import DayOfWeek from "@entities/DayOfWeek";
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";


@UseBefore(IsLogged)
@Validate()
export default class DayOfWeekController extends AbstractController {
    @Inject()
    private _service: AbstractDayOfWeekService;


    constructor(service: AbstractDayOfWeekService) {
        super();
        this._service = service;
    }


    @POST("list")     
    @SetDatabaseFromToken()
    public async PaginatedFilterAsync(@FromBody()params : DayOfWeekPaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._service.PaginatedFilterAsync(params));
    }

    
    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let time = await this._service.GetByIdAsync(id);

        if (!time)
            return this.NotFound({ Message: "DayOfWeek not found" });

        return this.OK(time);
    }

    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() time: DayOfWeek) : Promise<ActionResult>
    {
        return this.OK(await this._service.AddAsync(time));
    }

    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() time: DayOfWeek) : Promise<ActionResult>
    {
        return this.OK(await this._service.UpdateAsync(time));        
    }

    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "DayOfWeek not found" });

        return this.OK(await this._service.DeleteAsync(del));
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): Promise<ActionResult>
    {
        return Promise.resolve(this.OK(Type.CreateTemplateFrom<DayOfWeek>(DayOfWeek)));
    }


}



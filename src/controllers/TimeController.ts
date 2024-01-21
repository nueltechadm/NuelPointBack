import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, RequestJson } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractTimeService from "@contracts/AbstractTimeService";
import Time from "@entities/Time";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import { PaginatedFilterRequest } from "@contracts/AbstractService";

@UseBefore(IsLogged)
@Validate()
export default class TimeController extends AbstractController {
    @Inject()
    private _service: AbstractTimeService;


    constructor(service: AbstractTimeService) {
        super();
        this._service = service;
    }


    @POST("list")     
    @SetDatabaseFromToken()
    public async PaginatedFilterAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._service.PaginatedFilterAsync(params));
    }

    @POST("all")
    @SetDatabaseFromToken()
    public async GetAllAsync() :Promise<ActionResult> 
    {             
        return this.OK((await this._service.GetAllAsync()));
    }
    
    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let time = await this._service.GetByIdAsync(id);

        if (!time)
            return this.NotFound({ Message: "Time not found" });

        return this.OK(time);
    }

    @POST("insert")
    @SetDatabaseFromToken()
    @RequestJson(JSON.stringify(new Time("Sample"), null, 2))
    public async InsertAsync(@FromBody() time: Time) : Promise<ActionResult>
    {
        let result = await this._service.AddAsync(time);

        return this.OK({Message : "Time created", Id : result.Id});
    }

    @PUT("update")
    @SetDatabaseFromToken()
    @RequestJson(JSON.stringify(new Time("Sample"), null, 2))
    public async UpdateAsync(@FromBody() time: Time) : Promise<ActionResult>
    {
        let exists = await this._service.GetByIdAsync(time.Id);

        if(!exists)
            return this.NotFound({ Message: "Time not found" });

        Object.assign(exists, time);

        await this._service.UpdateAsync(exists);

        return this.OK({Message : "Time updated"});  
    }

    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Time not found" });

        await this._service.DeleteAsync(del);

        return this.OK({ Message: "Time deleted" });
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): Promise<ActionResult>
    {
        return Promise.resolve(this.OK(new Time("Sample")));
    }


}



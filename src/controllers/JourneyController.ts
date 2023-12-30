import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Authorization from "../utils/Authorization";
import AbstractJorneyService from "../core/abstractions/AbstractJorneyService";
import Journey from "../core/entities/Journey";
import { PaginatedFilterRequest } from "../core/abstractions/AbstractService";


@UseBefore(IsLogged)
@Validate()
export default class JourneyController extends AbstractController {
    @Inject()
    private _service: AbstractJorneyService;

    constructor(service: AbstractJorneyService) {
        super();
        this._service = service;
    }


    @POST("list")     
    @SetDatabaseFromToken()
    public async PaginatedFilterAsync(@FromBody()params : PaginatedFilterRequest): Promise<ActionResult> 
    {             
        return this.OK(await this._service.PaginatedFilterAsync(params));
    }



    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) :  Promise<ActionResult>
    {
        
        let job = await this._service.GetByIdAsync(id);

        if (!job)
            return this.NotFound({ Message: "JobRole not found" });

        delete (job as any).Employers;

        return this.OK(job);
    }




    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() journey: Journey) :  Promise<ActionResult>
    {
        return this.OK(await this._service.AddAsync(journey));
    }




    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() journey: Journey) : Promise<ActionResult>
    {
       return this.OK(await this._service.UpdateAsync(journey));
    }



    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {        
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Journey not found" });

        return this.OK(await this._service.DeleteAsync(del));
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() {
        return this.OK(Type.CreateTemplateFrom<Journey>(Journey));
    }


}

import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Authorization from "../utils/Authorization";
import AbstractJorneyService from "../core/abstractions/AbstractJorneyService";
import Journey from "../core/entities/Journey";


@UseBefore(IsLogged)
@Validate()
export default class JourneyController extends AbstractController {
    @Inject()
    private _service: AbstractJorneyService;

    constructor(service: AbstractJorneyService) {
        super();
        this._service = service;
    }

    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._service.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }

    @GET("list")
    @SetDatabaseFromToken()
    public async GetAllAsync(): Promise<void> {
        this.OK(await this._service.GetAllAsync());
    }

    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) {
        
        let job = await this._service.GetByIdAsync(id);

        if (!job)
            return this.NotFound({ Message: "JobRole not found" });

        delete (job as any).Employers;

        this.OK(job);
    }

    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() journey: Journey) {

        this.OK(await this._service.AddAsync(journey));
    }

    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() journey: Journey) {
        this.OK(await this._service.UpdateAsync(journey));
    }

    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) {
        
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Journey not found" });

        this.OK(await this._service.DeleteAsync(del));
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson() {
        this.OK(Type.CreateTemplateFrom<Journey>(Journey));
    }


}

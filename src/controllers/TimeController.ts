import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractTimeService from "../core/abstractions/AbstractTimeService";
import Time from "../core/entities/Time";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";

@UseBefore(IsLogged)
@Validate()
export default class TimeController extends AbstractController {
    @Inject()
    private _service: AbstractTimeService;

    constructor(service: AbstractTimeService) {
        super();
        this._service = service;
    }

    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._service.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }

    @GET("list")     
    @SetDatabaseFromToken()
    public async GetAllAsync(): Promise<void> {

        let times = await this._service.GetAllAsync();        
        this.OK(times);
    }

    @GET("getById")
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) {
        let time = await this._service.GetByIdAsync(id);

        if (!time)
            return this.NotFound({ Message: "Time not found" });

        this.OK(time);
    }

    @POST("insert")
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() time: Time) {
        this.OK(await this._service.AddAsync(time));
    }

    @PUT("update")
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() time: Time) {
        try {

            this.OK(await this._service.UpdateAsync(time));
        }
        catch (ex) {
            if (ex instanceof InvalidEntityException || ex instanceof EntityNotFoundException)
                return this.BadRequest({ Message: ex.message });

            return this.Error("Error while processing the request");
        }
    }

    @DELETE("delete")
    @SetDatabaseFromToken()
    public async DeleteAsync(@FromQuery() id: number) {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Time not found" });

        this.OK(await this._service.DeleteAsync(del));
    }

    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson()
    {
        this.OK(Type.CreateTemplateFrom<Time>(Time));
    }


}



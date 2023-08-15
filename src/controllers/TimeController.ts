import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractTimeService from "../core/abstractions/AbstractTimeService";
import Time from "../core/entities/Time";

@UseBefore(IsLogged)
@Validate()
export default class TimeController extends ControllerBase {
    @Inject()
    private _service: AbstractTimeService;

    constructor(service: AbstractTimeService) {
        super();
        this._service = service;
    }


    @GET("list")
    public async GetAllAsync(): Promise<void> {
        let times = await this._service.GetAllAsync();

        for (let j of times) {
            delete (j as any)._orm_metadata_;
        }

        this.OK(times);
    }

    @GET("getById")
    public async GetByIdAsync(@FromQuery() id: number) {
        let time = await this._service.GetByIdAsync(id);

        if (!time)
            return this.NotFound({ Message: "Time not found" });

        delete (time as any)._orm_metadata_;       

        this.OK(time);
    }

    @POST("insert")
    public async InsertAsync(@FromBody() time: Time) {
        this.OK(await this._service.AddAsync(time));
    }

    @PUT("update")
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
    public async DeleteAsync(@FromQuery() id: number) {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Time not found" });

        this.OK(await this._service.DeleteAsync(del));
    }


}

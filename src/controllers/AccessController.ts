import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import User from "../core/entities/User";
import { IsLogged } from '../filters/AuthFilter';
import Type from "../utils/Type";
import { AbstractAccessService } from "../core/abstractions/AbstractAccessService";
import Access from "../core/entities/Access";


@UseBefore(IsLogged)
@Validate()
export class AccessController extends ControllerBase {
    @Inject()
    private _service: AbstractAccessService;

    constructor(service: AbstractAccessService) {
        super();
        this._service = service;
    }


    @GET("list")
    public async GetAllAsync(): Promise<void> {
        let accesses = await this._service.GetAllAsync();

        accesses.forEach(s => this.RemovePassWordAndMetadata(s));

        this.OK(accesses);
    }

    @GET("getById")
    public async GetByIdAsync(@FromQuery() id: number): Promise<void> {
        let access = await this._service.GetByIdAsync(id);

        if (!access)
            this.NotFound(`Acess with ID ${id} not exists`);

        this.OK(this.RemovePassWordAndMetadata(access!));
    }

    @POST("insert")
    public async InsertAsync(@FromBody() access: Access): Promise<void> {
        this.OK(await this._service.AddAsync(access));
    }

    @PUT("update")
    public async UpdateAsync(@FromBody() access: Access) {
        if (access.Id == undefined || access.Id <= 0)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let update = await this._service.GetByIdAsync(access.Id);

        if (!update)
            return this.NotFound({ Message: "User not found" });

        this.OK(await this._service.UpdateAsync(access));
    }

    @DELETE("delete")
    public async DeleteAsync(@FromQuery() id: number) {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "User not found" });

        this.OK(await this._service.DeleteAsync(del));
    }

    private RemovePassWordAndMetadata(access?: Access): Access | undefined {
        if (!access)
            return undefined;

        delete (access as any).Password;

        return Type.RemoveORMMetadata(access);
    }
}

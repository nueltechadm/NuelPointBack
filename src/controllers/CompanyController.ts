import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RunBefore } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import Company from "../core/entities/Company";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";


@UseBefore(IsLogged)
@Validate()
export default class CompanyController extends AbstractController {
    @Inject()
    private _service: AbstractCompanyService;

    constructor(service: AbstractCompanyService) {
        super();
        this._service = service;
    }

    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._service.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }

    @GET("list")    
    @SetDatabaseFromToken()
    public async GetAllAsync(): Promise<void> {

        let companies = await this._service.GetAllAsync();        

        this.OK(Type.RemoveORMMetadata(companies));
    }

    @GET("getById")    
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() id: number) {
        let company = await this._service.GetByIdAsync(id);

        if (!company)
            return this.NotFound({ Message: "Company not found" });

        this.OK(Type.RemoveORMMetadata(company));
    }

    @POST("insert")    
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody() company: Company) {
        this.OK(await this._service.AddAsync(company));
    }

    @PUT("update")    
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() company: Company) {
        try {

            this.OK(await this._service.UpdateAsync(company));
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
            return this.NotFound({ Message: "Company not found" });

        this.OK(await this._service.DeleteAsync(del));
    }

    


}

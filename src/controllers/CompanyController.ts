import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import Company from "../core/entities/Company";


@UseBefore(IsLogged)
@Validate()
export default class CompanyController extends ControllerBase {
    @Inject()
    private _service: AbstractCompanyService;

    constructor(service: AbstractCompanyService) {
        super();
        this._service = service;
    }


    @GET("list")
    public async GetAllAsync(): Promise<void> {

        let companies = await this._service.GetAllAsync();

        this.RemoveMetadata(companies);

        this.OK(companies);
    }

    @GET("getById")
    public async GetByIdAsync(@FromQuery() id: number) {
        let company = await this._service.GetByIdAsync(id);

        if (!company)
            return this.NotFound({ Message: "Company not found" });

        this.RemoveMetadata([company]);

        this.OK(company);
    }

    @POST("insert")
    public async InsertAsync(@FromBody() company: Company) {
        this.OK(await this._service.AddAsync(company));
    }

    @PUT("update")
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
    public async DeleteAsync(@FromQuery() id: number) {
        if (!id)
            return this.BadRequest({ Message: "The ID must be greater than 0" });

        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Company not found" });

        this.OK(await this._service.DeleteAsync(del));
    }

    private RemoveMetadata(companies : Company[])
    {
        for (let j of companies) {
            delete (j as any)._orm_metadata_;

            for(let u of j.Users)
            {
                delete (u as any)._orm_metadata_;
            }
        }
    }


}

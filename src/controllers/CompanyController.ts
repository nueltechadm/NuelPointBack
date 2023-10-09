import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RunBefore, ProducesResponse } from "web_api_base";
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
    @CompanyController.ProducesType(200, "List of all comapanies in client database" , Company, true)    
    public async GetAllAsync(): Promise<void> {                

        this.OK(await this._service.GetAllAsync());
    }

    @GET("getByName")    
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, "Company filtered by name" , Company)   
    @CompanyController.ProducesMessage(404, "Not found the company", {Message : "Company not found"})
    public async GetByNameAsync(@FromQuery("name") name : string) {

        let company = await this._service.GetByNameAsync(name);   
        
        if(!company)
            return this.NotFound({Message : "Company not found"});
        else
            return this.OK(company);        
    }

    @GET("getById")    
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, "Company filtered by name" , Company)   
    @CompanyController.ProducesMessage(404, "Not found the company", {Message : "Company not found"})
    public async GetByIdAsync(@FromQuery() id: number) {

        let company = await this._service.GetByIdAsync(id);

        if (!company)
            return this.NotFound({ Message: "Company not found" });

        this.OK(company);
    }

    @POST("insert")    
    @SetDatabaseFromToken()
    @CompanyController.ReceiveType(Company)
    @CompanyController.ProducesType(200, "Just created company" , Company)  
    @CompanyController.ProducesMessage(400, "Invalid object", {Message : "Message describing the error"})
    @CompanyController.ProducesMessage(400, "Company already exists", {Message : "Already exists a company with name <company.name>"})
    public async InsertAsync(@FromBody() company: Company) {
        
        company.Id = -1;

        this._service.ValidateObject(company);        

        let exists = await this._service.GetByNameAsync(company.Name);

        if(exists)
            return this.BadRequest({Message : `Already exists a company with name : "${company.Name}"`});

        this.OK(await this._service.AddAsync(company));
    }

    @PUT("update")    
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() company: Company) {
        
        if(!company || !company.Id)
            return this.BadRequest({ Message: "Id is required" });

        let fromDB = await this._service.GetByIdAsync(company.Id);

        if (!fromDB)
            return this.NotFound({ Message: "Company not found" });

        await this._service.UpdateObjectAndRelationsAsync(company, ["Departaments", "Contacts"]);
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

    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson()
    {
        this.OK(Type.CreateTemplateFrom<Company>(Company));
    }
    


}

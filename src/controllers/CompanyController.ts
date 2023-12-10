import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RequestJson, ActionResult } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import AbstractCompanyService, { CompanyPaginatedFilterRequest, CompanyPaginatedFilterResponse } from "../core/abstractions/AbstractCompanyService";
import Company from "../core/entities/Company";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import { CompanyFilterDTO } from "../dto/CompanyFilterDTO";



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
    public async GetAllAsync(): Promise<ActionResult> 
    { 
        return this.OK(await this._service.GetAllAsync());
    }




    @POST("filter")    
    @SetDatabaseFromToken()
    @CompanyController.ReceiveType(CompanyPaginatedFilterRequest)
    @CompanyController.ProducesType(200, "List of all comapanies retrived by filters" , CompanyPaginatedFilterResponse)    
    public async FilterAsync(@FromBody()params : CompanyPaginatedFilterRequest) : Promise<ActionResult>
    {  
        return this.OK(await this._service.FilterAsync(params));
    }



    @GET("getByName")    
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, "Company filtered by name" , Company)   
    @CompanyController.ProducesMessage(404, "Not found the company", {Message : "Company not found"})
    public async GetByNameAsync(@FromQuery("name") name : string) : Promise<ActionResult>
    {         
        return this.OK(await this._service.GetByNameAsync(name));        
    }



    @GET("getById")    
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, "Company filtered by name" , Company)   
    @CompanyController.ProducesMessage(404, "Not found the company", {Message : "Company not found"})
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {

        let company = await this._service.GetByIdAsync(id);

        if (!company)
            return this.NotFound({ Message: "Company not found" });

        return this.OK(company);
    }


    @POST("insert")    
    @SetDatabaseFromToken()
    @RequestJson(CompanyController.CreateTemplateToInsertAndUpdate())
    @CompanyController.ProducesMessage(200, 'Success message', {Message : "Company created"})
    @CompanyController.ProducesMessage(400, 'Error message', {Message : 'Message describing the error'})    
    public async InsertAsync(@FromBody() company: Company) : Promise<ActionResult>
    {        
        company.Id = -1;

        this._service.ValidateObject(company);        

        let exists = await this._service.GetByNameAsync(company.Name);

        if(exists)
            return this.BadRequest({Message : `Already exists a company with name : "${company.Name}"`});

        return this.OK(await this._service.AddAsync(company));
    }


    @PUT("update")    
    @SetDatabaseFromToken()
    @RequestJson(CompanyController.CreateTemplateToInsertAndUpdate())
    @CompanyController.ProducesMessage(200, 'Success message', {Message : "Company updated"})
    @CompanyController.ProducesMessage(400, 'Error message', {Message : 'Message describing the error'})  
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})
    public async UpdateAsync(@FromBody() company: Company) : Promise<ActionResult> 
    {        
        if(!company || !company.Id)
            return this.BadRequest({ Message: "Id is required" });

        let fromDB = await this._service.GetByIdAsync(company.Id);

        if (!fromDB)
            return this.NotFound({ Message: "Company not found" }); 
        
        let exists = await this._service.GetByNameAsync(company.Name);

        if(exists.Any(s => s.Id != company.Id))
            return this.BadRequest({Message : `Already exists a company with name : "${company.Name}"`});

        await this._service.UpdateObjectAndRelationsAsync(company, ["Departaments", "Contacts"]);

        return this.OK(company);
    }



    @DELETE("delete")    
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : "Company deleted"})     
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})  
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {      
        let del = await this._service.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Company not found" });

        return this.OK(await this._service.DeleteAsync(del));
    }

    

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Company>(Company));
    }

        
    protected static CreateTemplateToInsertAndUpdate() : string
    {
        let o = Type.CreateTemplateFrom(Company);
        o = Type.Delete(o, 'Accesses');
        o = Type.Delete(o, 'Users');
        return JSON.stringify(o, null, 2);
    }

}




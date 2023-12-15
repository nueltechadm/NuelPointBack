import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RequestJson, ActionResult } from "web_api_base";
import { IsLogged } from '../filters/AuthFilter';
import AbstractCompanyService, { CompanyPaginatedFilterRequest, CompanyPaginatedFilterResponse } from "../core/abstractions/AbstractCompanyService";
import Company from "../core/entities/Company";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import Departament from "../core/entities/Departament";
import Contact from "../core/entities/Contact";
import AbstractDepartamentService from "../core/abstractions/AbstractDepartamentService";



@UseBefore(IsLogged)
@Validate()
export default class CompanyController extends AbstractController {
    
    
    @Inject()
    private _companyService: AbstractCompanyService;

    @Inject()
    private _departamentService: AbstractDepartamentService;


    constructor(
        companyService: AbstractCompanyService, 
        departamentService : AbstractDepartamentService
        ) {
        super();
        this._companyService = companyService;
        this._departamentService = departamentService;
    }

    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._companyService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._departamentService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }

    @POST("filter")    
    @SetDatabaseFromToken()
    @CompanyController.ReceiveType(CompanyPaginatedFilterRequest)
    @CompanyController.ProducesType(200, 'List of all comapanies retrived by filters' , CompanyPaginatedFilterResponse)    
    public async FilterAsync(@FromBody()params : CompanyPaginatedFilterRequest) : Promise<ActionResult>
    {  
        return this.OK(await this._companyService.GetAllAsync(params));
    }


    @GET("getById")    
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, 'The company with provided id' , Company)   
    @CompanyController.ProducesMessage(404, 'Error message', {Message : "Company not found"})
    public async GetByIdAsync(@FromQuery() id: number) : Promise<ActionResult>
    {
        let company = await this._companyService.GetByIdAsync(id);

        if (!company)
            return this.NotFound({ Message: "Company not found" });

        return this.OK(company);
    }


    @POST("insert")    
    @SetDatabaseFromToken()
    @RequestJson(CompanyController.CreateTemplateToInsertAndUpdate())
    @CompanyController.ProducesMessage(200, 'Success message', {Message : "Company created", Id : 1})
    @CompanyController.ProducesMessage(400, 'Error message', {Message : 'Message describing the error'})    
    public async InsertAsync(@FromBody() company: Company) : Promise<ActionResult>
    {        
        company.Id = -1;               

        let exists = await this._companyService.GetByNameAsync(company.Name);

        if(exists)
            return this.BadRequest({Message : `Already exists a company with name : "${company.Name}"`});

        await this._companyService.AddAsync(company);

        return this.OK({Message : "Company created", Id : company.Id})
    }


    @PUT("update")    
    @SetDatabaseFromToken()
    @RequestJson(CompanyController.CreateTemplateToInsertAndUpdate())
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Company updated'})
    @CompanyController.ProducesMessage(400, 'Error message', {Message : 'Message describing the error'})  
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})
    public async UpdateAsync(@FromBody() company: Company) : Promise<ActionResult> 
    {        
        if(!company.Id)
            return this.BadRequest({ Message: "Id is required" });

        let fromDB = await this._companyService.GetByIdAsync(company.Id);

        if (!fromDB)
            return this.NotFound({ Message: "Company not found" }); 
        
        let exists = await this._companyService.GetByNameAsync(company.Name);

        if(exists.Any(s => s.Id != company.Id))
            return this.BadRequest({Message : `Already exists a company with name : "${company.Name}"`});

        await this._companyService.UpdateObjectAndRelationsAsync(company, ["Departaments", "Contacts", "Address"]);

        return this.OK({Message : "Company updated"});
    }


    
    @PUT("departament")  
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Departament ${departament} added to company ${company}'})     
    @CompanyController.ProducesMessage(400, 'Error message', {Message : 'Departament ${departament} already is of ${company}'})      
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company with Id ${companyId} not exists'})      
    public async AddDepartament(@FromQuery()companyId : number, @FromQuery() departamentId : number) : Promise<ActionResult>
    {
        let company = (await this._companyService.GetByAndLoadAsync("Id", companyId, ["Departaments"])).FirstOrDefault();

        if(!company)
            return this.NotFound({Message : `Company with Id ${companyId} not exists`});
        
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", departamentId, [])).FirstOrDefault();

        if(!departament)
            return this.NotFound({Message : `Departament with Id ${departamentId} not exists`});     
         
        if(company.Departaments.Any(s => s.Id == departament!.Id))
            return this.BadRequest({Message : `Departament ${departament!.Name} already is of ${company.Name}`}); 

        company.Departaments.Add(departament);

        await this._companyService.UpdateObjectAndRelationsAsync(company, ["Departaments"]);

        return this.OK({Message : `Departament ${departament.Name} added to company ${company.Name}`});
    }



    @PUT("departament/delete")  
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Departament ${departament} added to company ${company}'})     
    @CompanyController.ProducesMessage(400, 'Error message', {Message : 'Departament ${departament} already is of ${company}'})      
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company with Id ${companyId} not exists'})      
    public async DeleteDepartament(@FromQuery()companyId : number, @FromQuery() departamentId : number) : Promise<ActionResult>
    {
        let company = (await this._companyService.GetByAndLoadAsync("Id", companyId, ["Departaments"])).FirstOrDefault();

        if(!company)
            return this.NotFound({Message : `Company with Id ${companyId} not exists`});
        
        let departament = (await this._departamentService.GetByAndLoadAsync("Id", departamentId, [])).FirstOrDefault();

        if(!departament)
            return this.NotFound({Message : `Departament with Id ${departamentId} not exists`});     
         
        if(!company.Departaments.Any(s => s.Id == departament!.Id))
            return this.BadRequest({Message : `Departament ${departament!.Name} not is part of ${company.Name}`}); 

        company.Departaments.RemoveAll(s => s.Id == departament?.Id);

        await this._companyService.UpdateObjectAndRelationsAsync(company, ["Departaments"]);

        return this.OK({Message : `Departament ${departament.Name} deleted of company ${company.Name}`});
    }
    


    @DELETE("delete")    
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Company deleted'})     
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})  
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {      
        let del = await this._companyService.GetByIdAsync(id);

        if (!del)
            return this.NotFound({ Message: "Company not found" });

        await this._companyService.DeleteAsync(del);

        return this.OK({Message : 'Company deleted'});
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
        let d = Type.CreateTemplateFrom(Departament);        
        o.Departaments = [Type.Delete(d, 'JobRoles')];
        o.Contacts = [Type.CreateTemplateFrom(Contact)];
        return JSON.stringify(o, null, 2);
    }

}




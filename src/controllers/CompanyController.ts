import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RequestJson, ActionResult } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractCompanyService, { CompanyPaginatedFilterRequest, CompanyPaginatedFilterResponse } from "@contracts/AbstractCompanyService";
import Company from "@entities/Company";
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import Contact from "@entities/Contact";
import AbstractDepartamentService from "@contracts/AbstractDepartamentService";
import Address from "@entities/Address";
import AbstractUserService from "@contracts/AbstractUserService";



@UseBefore(IsLogged)
@Validate()
export default class CompanyController extends AbstractController {
    
    
    @Inject()
    private _companyService: AbstractCompanyService;

    @Inject()
    private _departamentService: AbstractDepartamentService;


    @Inject()
    private _userService: AbstractUserService;


    constructor(
        companyService: AbstractCompanyService, 
        departamentService : AbstractDepartamentService,
        userService : AbstractUserService
        ) {
        super();
        this._companyService = companyService;
        this._departamentService = departamentService;
        this._userService = userService;       
        
    }


    @POST("filter")    
    @SetDatabaseFromToken()
    @CompanyController.ReceiveType(CompanyPaginatedFilterRequest)
    @CompanyController.ProducesType(200, 'List of all comapanies retrived by filters' , CompanyPaginatedFilterResponse)    
    public async PaginatedFilterAsync(@FromBody()params : CompanyPaginatedFilterRequest) : Promise<ActionResult>
    {  
        return this.OK(await this._companyService.PaginatedFilterAsync(params));
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
        let exists = await this._companyService.GetByNameAsync(company.Name);

        if(exists.Any())
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

        let exists = await this._companyService.GetByAndLoadAsync("Id", company.Id, []);

        if (!exists.Any())
            return this.NotFound({ Message: 'Company not found' }); 
        
        exists = await this._companyService.GetByNameAsync(company.Name);

        if(exists.Any(s => s.Id != company.Id))
            return this.BadRequest({Message : `Already exists a company with name : "${company.Name}"`});

        await this._companyService.UpdateObjectAndRelationsAsync(company, ["Contacts", "Address"]);

        return this.OK({Message : 'Company updated'});
    }

    @PUT("activate")    
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Company activated'})     
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})  
    public async ActiveAsync(@FromQuery() id: number) : Promise<ActionResult>
    {      
        let active = (await this._companyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!active)
            return this.NotFound({ Message: 'Company not found' });

        active.Active = true;

        await this._companyService.UpdateAsync(active);

        return this.OK({Message : 'Company activated'});
    }


    
    @PUT("desactivate")    
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Company desactivated'})     
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})  
    public async DesactiveAsync(@FromQuery() id: number) : Promise<ActionResult>
    {      
        let desactive = (await this._companyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!desactive)
            return this.NotFound({ Message: 'Company not found' });

        desactive.Active = false;

        await this._companyService.UpdateAsync(desactive);

        return this.OK({Message : 'Company desactivated'});
    }


    
    @PUT("add/user")       
    @SetDatabaseFromToken()
    public async AddUserAsync(@FromQuery()companyId : number, @FromQuery()userId : number) : Promise<ActionResult>
    {  
        let company = (await this._companyService.GetByAndLoadAsync("Id", companyId, ["Users"])).FirstOrDefault();

        if(!company)
             return this.NotFound({Message : "Company not found"}); 

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["Company"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : "User not found"}); 
                         
        company.Users.RemoveAll(s => s.Id == userId);

        company.Users.Add(user);

        await this._userService.UpdateAsync(user);

        return this.OK({Message : `Company updated`});

    }



    @DELETE("delete")    
    @SetDatabaseFromToken()    
    @CompanyController.ProducesMessage(200, 'Success message', {Message : 'Company deleted'})     
    @CompanyController.ProducesMessage(404, 'Error message', {Message : 'Company not found'})  
    public async DeleteAsync(@FromQuery() id: number) : Promise<ActionResult>
    {      
        let del = (await this._companyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!del)
            return this.NotFound({ Message: 'Company not found' });

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
        o.Contacts = [Type.CreateTemplateFrom(Contact)];
        o.Address = Type.CreateTemplateFrom(Address);
        return JSON.stringify(o, null, 2);
    }

}




import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RequestJson, ActionResult, Description } from "web_api_base";
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
import User from "@src/core/entities/User";



@UseBefore(IsLogged)
@Validate()
export default class CompanyController extends AbstractController
{


    @Inject()
    private _companyService: AbstractCompanyService;

    @Inject()
    private _departamentService: AbstractDepartamentService;


    @Inject()
    private _userService: AbstractUserService;


    constructor(
        companyService: AbstractCompanyService,
        departamentService: AbstractDepartamentService,
        userService: AbstractUserService
    )
    {
        super();
        this._companyService = companyService;
        this._departamentService = departamentService;
        this._userService = userService;

    }

    @GET("all")
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, 'Lista de todas as empresas registradas no banco de dados', CompanyPaginatedFilterResponse)
    @Description(`Utilize esse metodo para visualizar uma lista de todas empresas registradas no banco de dados`)
    public async GetAllAsync(): Promise<ActionResult> 
    {
        return this.OK((await this._companyService.GetAllAsync()));
    }


    @POST("filter")
    @SetDatabaseFromToken()
    @CompanyController.ReceiveType(CompanyPaginatedFilterRequest)
    @CompanyController.ProducesType(200, 'Lista de todas as empresas recuperadas pelo filtro', CompanyPaginatedFilterResponse)
    @Description(`Utilize esse metodo para visualizar uma lista de todas empresas recuperadas pelo filtro`)
    public async PaginatedFilterAsync(@FromBody() params: CompanyPaginatedFilterRequest): Promise<ActionResult>
    {
        return this.OK(await this._companyService.PaginatedFilterAsync(params));
    }


    @GET("getById")
    @SetDatabaseFromToken()
    @CompanyController.ProducesType(200, 'A empresa com o Id fornecido', Company)
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: "Empresa não encontrada" })
    @Description(`Utilize esse metodo para visualizar uma empresa especifica pelo Id`)
    public async GetByIdAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let company = await this._companyService.GetByIdAsync(id);

        if (!company)
            return this.NotFound({ Message: "Empresa não encontrada" });

        return this.OK(company);
    }


    @POST("insert")
    @SetDatabaseFromToken()
    @RequestJson(CompanyController.CreateTemplateToInsertAndUpdate())
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: "Empresa criada", Id: 1 })
    @CompanyController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Mensagem descrevendo o erro' })
    @Description(`Utilize esse metodo para inserir uma empresa ao banco de dados`)
    public async InsertAsync(@FromBody() company: Company): Promise<ActionResult>
    {
        let exists = await this._companyService.GetByNameAsync(company.Name);

        if (exists.Any())
            return this.BadRequest({ Message: `Já existe uma empresa com nome : "${company.Name}"` });

        await this._companyService.AddAsync(company);

        return this.OK({ Message: "Empresa criada", Id: company.Id })
    }


    @PUT("update")
    @SetDatabaseFromToken()
    @RequestJson(CompanyController.CreateTemplateToInsertAndUpdate())
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Empresa atualizada' })
    @CompanyController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Mensagem descrevendo o erro' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para atualizar uma empresa do banco de dados`)
    public async UpdateAsync(@FromBody() company: Company): Promise<ActionResult> 
    {
        if (!company.Id)
            return this.BadRequest({ Message: "Id é necessário" });

        let exists = await this._companyService.GetByAndLoadAsync("Id", company.Id, []);

        if (!exists.Any())
            return this.NotFound({ Message: 'Empresa não encontrada' });

        exists = await this._companyService.GetByNameAsync(company.Name);

        if (exists.Any(s => s.Id != company.Id))
            return this.BadRequest({ Message: `Já existe uma empresa com nome : "${company.Name}"` });

        await this._companyService.UpdateObjectAndRelationsAsync(company, ["Contacts", "Address"]);

        return this.OK({ Message: 'Empresa atualizada' });
    }



    @PUT("contact")
    @SetDatabaseFromToken()
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Contatos da empresa atualizados' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para adicionar ou editar um ${Contact.name} de um ${Company.name}`)
    public async UpdateContact(@FromQuery() companyId: number, @FromBody() contact: Contact): Promise<ActionResult>
    {
        let companies = await this._companyService.GetByAndLoadAsync("Id", companyId, ["Contacts"]);

        if (!companies.Any())
            return this.NotFound({ Message: `Empresa com Id ${companyId} não existe` });

        companies.First().Contacts.RemoveAll(s => s.Id == contact.Id);

        companies.First().Contacts.Add(contact);

        await this._companyService.UpdateAsync(companies.First());

        return this.OK('Contatos da empresa atualizados');
    }

    @PUT("delete/contact")
    @SetDatabaseFromToken()
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Contato da empresa deletado' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para remover um ${Contact.name} de um ${Company.name}`)
    public async DeleteContact(@FromQuery() companyId: number, @FromQuery() contactId: number): Promise<ActionResult>
    {
        let company = (await this._companyService.GetByAndLoadAsync("Id", companyId, ["Contacts"])).FirstOrDefault();

        if (!company)
            return this.NotFound({ Message: `Empresa com Id ${companyId} não existe` });

        if (!company.Contacts.Any(s => s.Id == contactId))
            return this.NotFound({ Message: `Empresa com Id ${companyId} não tem contato com Id ${contactId}` });

        company.Contacts.RemoveAll(s => s.Id == contactId);

        await this._companyService.UpdateAsync(company);

        return this.OK('Contatos da empresa atualizados');
    }


    @PUT("activate")
    @SetDatabaseFromToken()
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Empresa ativada' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para atualizar o estado atual da empresa para ativado`)
    public async ActiveAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let active = (await this._companyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!active)
            return this.NotFound({ Message: 'Empresa não encontrada' });

        active.Active = true;

        await this._companyService.UpdateAsync(active);

        return this.OK({ Message: 'Empresa ativada' });
    }



    @PUT("desactivate")
    @SetDatabaseFromToken()
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Empresa desativada' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para atualizar o estado atual da empresa para desativado`)
    public async DesactiveAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let desactive = (await this._companyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!desactive)
            return this.NotFound({ Message: 'Empresa não encontrada' });

        desactive.Active = false;

        await this._companyService.UpdateAsync(desactive);

        return this.OK({ Message: 'Empresa desativada' });
    }



    @PUT("add/user")
    @SetDatabaseFromToken()
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Empresa atualizada' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para adicionar um ${User.name} em uma ${Company.name}`)
    public async AddUserAsync(@FromQuery() companyId: number, @FromQuery() userId: number): Promise<ActionResult>
    {
        let company = (await this._companyService.GetByAndLoadAsync("Id", companyId, ["Users"])).FirstOrDefault();

        if (!company)
            return this.NotFound({ Message: "Empresa não encontrada" });

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["Company"])).FirstOrDefault();

        if (!user)
            return this.NotFound({ Message: "Usuário não encontrado" });

        company.Users.RemoveAll(s => s.Id == userId);

        company.Users.Add(user);

        await this._userService.UpdateAsync(user);

        return this.OK({ Message: `Empresa atualizada` });

    }



    @DELETE("delete")
    @SetDatabaseFromToken()
    @CompanyController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Empresa deletada' })
    @CompanyController.ProducesMessage(404, 'Mensagem de erro', { Message: 'Empresa não encontrada' })
    @Description(`Utilize esse metodo para remover uma ${Company.name}`)
    public async DeleteAsync(@FromQuery() id: number): Promise<ActionResult>
    {
        let del = (await this._companyService.GetByAndLoadAsync("Id", id, [])).FirstOrDefault();

        if (!del)
            return this.NotFound({ Message: 'Empresa não encontrada' });

        await this._companyService.DeleteAsync(del);

        return this.OK({ Message: 'Empresa deletada' });
    }


    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Company>(Company));
    }


    protected static CreateTemplateToInsertAndUpdate(): string
    {
        let o = Type.CreateTemplateFrom(Company);
        o = Type.Delete(o, 'Accesses');
        o = Type.Delete(o, 'Users');
        o.Contacts = [Type.CreateTemplateFrom(Contact)];
        o.Address = Type.CreateTemplateFrom(Address);
        return JSON.stringify(o, null, 2);
    }

}




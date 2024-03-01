
import { POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ProducesResponse, ActionResult, RequestJson, Description } from "web_api_base";
import AbstractUserService, { UserPaginatedFilterRequest, UserUnPaginatedFilterRequest } from "@contracts/AbstractUserService";
import User from "@entities/User";
import {IsLogged} from '@filters/AuthFilter';
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "@utils/Authorization";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import Journey from "@entities/Journey";
import AbstractJorneyService from "@contracts/AbstractJorneyService";
import Company from "@entities/Company";
import AbstractCompanyService from "@contracts/AbstractCompanyService";
import AbstractJobRoleService from "@contracts/AbstractJobRoleService";
import JobRole from "@entities/JobRole";
import { PaginatedFilterRequest } from "@contracts/AbstractService";
import AbstractAccessService from "@contracts/AbstractAccessService";
import Contact from "@entities/Contact";
import Access, { PERFILTYPE } from "@entities/Access";
import { MD5 } from "@utils/Cryptography";

@UseBefore(IsLogged)
@Validate()
export default class UserController extends AbstractController
{   
    @Inject()
    private _userService : AbstractUserService;

    @Inject()
    private _journeyService : AbstractJorneyService;

    @Inject()
    private _companyService : AbstractCompanyService;

    @Inject()
    private _jobRoleService : AbstractJobRoleService;

    @Inject()
    private _accessService : AbstractAccessService;

    constructor(
            userService    : AbstractUserService, 
            journeyService : AbstractJorneyService, 
            companyService : AbstractCompanyService, 
            jobRoleService : AbstractJobRoleService,
            accessService : AbstractAccessService
        )
    {
        super();                    
        this._userService = userService;
        this._journeyService = journeyService;
        this._companyService = companyService;
        this._jobRoleService = jobRoleService;
        this._accessService = accessService;
    }    

    @POST("Filter")
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description : "Lista de todos os usuários recuperados pelo filtro", JSON : JSON.stringify([Type.CreateInstance(User)], null, 2)}) 
    @Description(`Utilize esse metodo para realizar consulta de ${User.name}`)   
    public async UnPaginatedFilterAsync(@FromBody()params : UserUnPaginatedFilterRequest) : Promise<ActionResult>
    {       
       let unpaginatedResult =  await this._userService.UnPaginatedFilterAsync(params);

       unpaginatedResult.Result.forEach(s => this.RemovePassword(s));

       return this.OK(unpaginatedResult);
    }    

    @POST("list")
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description : "Lista de todos os usuários deste banco de dados", JSON : JSON.stringify([Type.CreateInstance(User)], null, 2)}) 
    @Description(`Utilize esse metodo para realizar consulta de ${User.name}`)   
    public async PaginatedFilterAsync(@FromBody()params : UserPaginatedFilterRequest) : Promise<ActionResult>
    {       
       let paginatedResult =  await this._userService.PaginatedFilterAsync(params);

       paginatedResult.Result.forEach(s => this.RemovePassword(s));

       return this.OK(paginatedResult);
    }    


    
    @GET("getById")   
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200,  "O usuário com o Id fornecido", User)
    @UserController.ProducesMessage(400, " userId Inválido", {Message : "userId Inválido"}) 
    @Description(`Utilize esse metodo para obter um ${User.name} por id e carregar as demais relações`)   
    public async GetByIdAsync(@FromQuery()id : number) : Promise<ActionResult>
    { 
       let users = await this._userService.GetByAndLoadAsync("Id", id, ["Access", "Company" ,"Contacts", "JobRole", "Journey"]);

       if(users.length == 0)
            return this.NotFound();
        else
            return this.OK(this.RemovePassword(users[0]));
    }       
    
    
    @POST("perfils")
    @SetDatabaseFromToken()
    @ProducesResponse({ Status : 200, Description : "Lista de todos os perfis disponiveis deste banco de dados", JSON : JSON.stringify([Type.CreateInstance(User)], null, 2)}) 
    @Description(`Utilize esse metodo obter todos os tipos de perfis disponiveis`)   
    public async GetPerfils() : Promise<ActionResult>
    {       
      return this.OK(Object.values(PERFILTYPE));
    }    
    

    
    @POST("insert")
    @SetDatabaseFromToken()
    @UserController.ProducesType(200, 'O usuário recém-criado', User) 
    @RequestJson(JSON.stringify(Type.CreateTemplateFrom(User, false, ["Access"], []), null, 2)) 
    @Description(`Utilize esse metodo para criad um novo ${User.name}`)   
    public async InsertAsync(@FromBody()user : User) : Promise<ActionResult>
    {         
        user.Directory = this.Request.APIAUTH.Link;
        
        await this._userService.AddAsync(user);

        return this.OK({Message : 'User created', Id : user.Id});
    }


    @PUT("contact")  
    @SetDatabaseFromToken() 
    @UserController.ProducesMessage(200, "Mensagem de sucesso", {Message : "Contato do usuário atualizado"})  
    @UserController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Usuário não encontrada'}) 
    @Description(`Utilize esse metodo para adicionar ou editar um ${Contact.name} de um ${User.name}`)       
    public async UpdateContact(@FromQuery()userId : number, @FromBody()contact : Contact) : Promise<ActionResult>
    {        
        let users= await this._userService.GetByAndLoadAsync("Id", userId, ["Contacts"]);

        if(!users.Any())
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        users.First().Contacts.RemoveAll(s => s.Id == contact.Id);        

        users.First().Contacts.Add(contact);       

        await this._userService.UpdateAsync(users.First());

        return this.OK('User´s contacts updated');
    }

    @PUT("delete/contact")  
    @SetDatabaseFromToken()
    @UserController.ProducesMessage(200, "Mensagem de sucesso", {Message : "Contato do usuário atualizado"})  
    @UserController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Usuário não encontrada'}) 
    @Description(`Utilize esse metodo para remover um ${Contact.name} de um ${User.name}`)   
    public async DeleteContact(@FromQuery()userId : number, @FromQuery()contactId : number) : Promise<ActionResult>
    {        
        let user= (await this._userService.GetByAndLoadAsync("Id", userId, ["Contacts"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        if(!user.Contacts.Any(s => s.Id == contactId))
            return this.NotFound({Message : `User with Id ${userId} dot not have a contact with Id ${contactId}`});        

        user.Contacts.RemoveAll(s => s.Id == contactId);              

        await this._userService.UpdateAsync(user);

        return this.OK('User´s contacts updated');
    }
    
    
    @PUT("access")  
    @SetDatabaseFromToken()
    @UserController.ProducesMessage(200, "Mensagem de sucesso", {Message : "Acesso do usuário atualizado"})
    @UserController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Usuário não encontrada'})        
    @Description(`Utilize esse metodo para atualizar o ${Access.name} de um ${User.name}`)   
    public async UpdateAccess(@FromQuery()userId : number, @FromBody()access : Access) : Promise<ActionResult>
    {        
        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["Access"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : `User with Id ${userId} not exists`});          
        
        access.Id = user.Access.Id;

        if(access.Password != user.Access.Password)
            access.Password = MD5(access.Password);

        Object.assign(user.Access, access);            

        await this._userService.UpdateAsync(user);

        return this.OK('User´s access updated');
    }


    
    @PUT("journey")  
    @SetDatabaseFromToken() 
    @UserController.ProducesMessage(200, "Mensagem de sucesso", {Message : "Jornada do usuário atualizado"})
    @UserController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Usuário não encontrada'})  
    @Description(`Utilize esse metodo para atualizar a ${Journey.name} de um ${User.name}`) 
    public async UpdateJouney(@FromQuery()userId : number, @FromQuery()journeyId : number) : Promise<ActionResult>
    {        
        let user= (await this._userService.GetByAndLoadAsync("Id", userId, ["Journey"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let journey = (await this._journeyService.GetByAndLoadAsync("Id", journeyId, [])).FirstOrDefault();

        if(!journey)
            return this.NotFound({Message : `Journey with Id ${journeyId} not exists`});

        user.Journey = journey;       

        await this._userService.UpdateAsync(user);

        return this.OK('User´s journey updated');
    }




    
    @PUT("company")  
    @SetDatabaseFromToken()  
    @UserController.ProducesMessage(200, "Mensagem de sucesso", {Message : "Empresa do usuário atualizado"})
    @UserController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Usuário não encontrada'})   
    @Description(`Utilize esse metodo para atualizar a ${Company.name} de um ${User.name}`)     
    public async UpdateCompany(@FromQuery()userId : number, @FromQuery()companyId : number) : Promise<ActionResult>
    {        
        let user= (await this._userService.GetByAndLoadAsync("Id", userId, ["Company"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let company = (await this._companyService.GetByAndLoadAsync("Id", companyId, [])).FirstOrDefault();

        if(!company)
            return this.NotFound({Message : `Company with Id ${companyId} not exists`});

        user.Company = company;       

        await this._userService.UpdateAsync(user);

        return this.OK('User´s company updated');
    }




    @PUT("jobRole")  
    @SetDatabaseFromToken() 
    @UserController.ProducesMessage(200, "Mensagem de sucesso", {Message : "Função do usuário atualizado"})
    @UserController.ProducesMessage(404, 'Mensagem de erro', {Message : 'Usuário não encontrada'})       
    @Description(`Utilize esse metodo para atualizar a ${JobRole.name} de um ${User.name}`)  
    public async UpdatejobRole(@FromQuery()userId : number, @FromQuery()jobRoleId : number) : Promise<ActionResult>
    {        
        let user= (await this._userService.GetByAndLoadAsync("Id", userId, ["JobRole"])).FirstOrDefault();

        if(!user)
            return this.NotFound({Message : `User with Id ${userId} not exists`});        

        let job = (await this._jobRoleService.GetByAndLoadAsync("Id", jobRoleId, [])).FirstOrDefault();

        if(!job)
            return this.NotFound({Message : `JobRole with Id ${jobRoleId} not exists`});

        user.JobRole = job;       

        await this._userService.UpdateAsync(user);

        return this.OK('User´s job updated');
    }
    
    

    
    @PUT("update")  
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "O usuário recém-atualizado", User)   
    @UserController.ProducesMessage(400, "Uma mensagem dizendo o que esta faltando", {Message : "O Id precisa ser maior que 0"})
    @UserController.ProducesMessage(404, "Mensagem de erro", {Message : "Usuário não encontrado"})  
    @Description(`Utilize esse metodo para atualizar apenas dados do ${User.name}. Nenhuma das relações será atualizada`)
    public async UpdateAsync(@FromBody()user : User) : Promise<ActionResult>
    {        
        if(user.Id == undefined || user.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = (await this._userService.GetByAndLoadAsync("Id", user.Id, [])).FirstOrDefault();

        if(!update)
            return this.NotFound({Message : "User not found"});

        Object.assign(update, user);

        return this.OK(await this._userService.UpdateObjectAndRelationsAsync(update!, []));
    }



    @DELETE("delete")   
    @SetDatabaseFromToken() 
    @UserController.ProducesType(200, "O Usuário recém-deletado", User)   
    @UserController.ProducesMessage(400, "Mensagem de erro", {Message : "O Id preisa ser maior que 0"})
    @UserController.ProducesMessage(404, "Mensagem de erro", {Message : "Usuário não encontrado"}) 
    public async DeleteAsync(@FromQuery()id : number) : Promise<ActionResult>
    {  
        if(!id)
            return this.BadRequest({ Message : "The Id must be greater than 0"});

        let del = await this._userService.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "User not found"});

        return this.OK(await this._userService.DeleteAsync(del));
    }


    
    @GET("getJson")
    @SetDatabaseFromToken()
    public async GetJson() : Promise<ActionResult>
    {
        return Promise.resolve(this.OK(Type.CreateTemplateFrom<User>(User)));
    }

    private RemovePassword(user? : User) : User | undefined
    {
        if(!user)
            return undefined;

        if(user.Access)
            delete (user.Access as any).Password;        

        return user;
    }

    
}




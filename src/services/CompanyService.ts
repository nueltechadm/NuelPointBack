import AbstractCompanyService, { CompanyPaginatedFilterRequest, CompanyPaginatedFilterResponse } from "../core/abstractions/AbstractCompanyService";
import {Inject} from'web_api_base'
import Company from "../core/entities/Company";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Departament from "../core/entities/Departament";
import { AbstractSet, Operation } from "myorm_core";
import AbstractDBContext from "../data/abstract/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from "../core/abstractions/AbstractService";

export default class CompanyService  extends AbstractCompanyService
{
    
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
       await this._context.SetDatabaseAsync(client);
    }

    public async CountAsync(): Promise<number> {        
        return await this._context.Collection(Company).CountAsync();
    }

    public override IsCompatible(obj: any): obj is Company {
        return obj.constructor == Company && Type.HasKeys<Company>(obj, "Name", "Description", "Document");
    }

    public override async GetByIdAsync(id: number): Promise<Company | undefined> {       
        return await this._context.Collection(Company)
        .WhereField("Id")
        .IsEqualTo(id)
        .LoadRelationOn("Departaments")
        .LoadRelationOn("Address")
        .LoadRelationOn("Accesses")
        .LoadRelationOn("Contacts")
        .LoadRelationOn("Users")
        .FirstOrDefaultAsync();
    }   
    

    public override async GetAllAsync(request : CompanyPaginatedFilterRequest) : Promise<CompanyPaginatedFilterResponse>  
    {
        let offset = request.Page - 1 * request.Quantity; 

        let total = await this.BuildQuery(request).CountAsync();

        let companies = await this.BuildQuery(request).Limit(request.Quantity).Offset(offset).ToListAsync();  

        let result = new CompanyPaginatedFilterResponse(companies, companies.Count(), total, request.Page);
        
        return result;
    }  

    protected BuildQuery(params : CompanyPaginatedFilterRequest) : AbstractSet<Company>
    {
        if(params.Name)
            this._context.Collection(Company).Where({Field: "Name", Kind : Operation.CONSTAINS, Value: params.Name});
        if(params.Description)
            this._context.Collection(Company).Where({Field: "Description", Kind : Operation.CONSTAINS, Value: params.Description});
        if(params.Document)
            this._context.Collection(Company).Where({Field: "Document", Kind : Operation.CONSTAINS, Value: params.Document});
        if(params.Active)
            this._context.Collection(Company).Where({Field: "Active", Kind : Operation.CONSTAINS, Value: params.Active});

        return this._context.Collection(Company);
    }
   
    
    public override async AddDepartamentToAllAsync(departament: Departament): Promise<void> {
        
        let companies = await this._context.Collection(Company).LoadRelationOn("Departaments").ToListAsync();     
        
        for(let c of companies)
        {
            c.Departaments.Add(departament);
            await this._context.Collection(Company).UpdateAsync(c);
        }

    }
      

    public override async AddAsync(obj: Company): Promise<Company> {

        this.ValidateObject(obj);

        return this._context.Collection(Company).AddAsync(obj);
    }


    public override async UpdateAsync(obj: Company): Promise<Company> {

        this.ValidateObject(obj);

        return await this._context.Collection(Company).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Company>(obj: Company, relations: U[]): Promise<Company> {

        this.ValidateObject(obj);

        return await this._context.Collection(Company).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public override async GetByAndLoadAsync<K extends keyof Company>(key: K, value: Company[K], load: (keyof Company)[]): Promise<Company[]> 
    {
       this._context.Collection(Company).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Company).Join(l);
        
       return await this._context.Collection(Company).ToListAsync();
    } 

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Company).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async DeleteAsync(obj: Company): Promise<Company> {
        return this._context.Collection(Company).DeleteAsync(obj);
    }


     

    public override async GetByNameAsync(name: string): Promise<Company[]> {        
        return await this._context.Collection(Company).Where({Field: "Name", Kind: Operation.CONSTAINS,  Value : name.Trim()}).ToListAsync();
    }

    public override ValidateObject(obj : Company) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${Company.name} type`);

        if(!obj.Name)
            throw new InvalidEntityException(`The name of ${Company.name} is required`); 
        
        if(!obj.Description)
            throw new InvalidEntityException(`The description of ${Company.name} is required`);
    
        if(!obj.Document)
            throw new InvalidEntityException(`The document of ${Company.name} is required`);
    } 
   
}

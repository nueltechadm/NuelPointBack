import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import Company from "../core/entities/Company";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";

export default class CompanyService  extends AbstractCompanyService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.Companies.CountAsync();
    }

    public override IsCompatible(obj: any): obj is Company {
        return Type.HasKeys<Company>(obj, "Name");
    }
    public async GetByIdAsync(id: number): Promise<Company | undefined> {       
        return await this._context.Companies.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }      
    public async AddAsync(obj: Company): Promise<Company> {

        this.CommomValidations(obj);

        return this._context.Companies.AddAsync(obj);
    }
    public async UpdateAsync(obj: Company): Promise<Company> {

        this.CommomValidations(obj);

        return this._context.Companies.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Company): Promise<Company> {
        return this._context.Companies.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Company[]> {
        return await this._context.Companies.OrderBy("Description").ToListAsync();
    }    
    
    private CommomValidations(obj : Company) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${Company.name} type`);

        if(!obj.Name)
            throw new InvalidEntityException(`The name of ${Company.name} is required`);         
    }
}

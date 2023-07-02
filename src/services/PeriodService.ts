import AbstractPeriodService from "../core/abstractions/AbstractPeriodService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import Company from "../core/entities/Company";
import Period from "../core/entities/Period";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";

export default class CompanyService  extends AbstractPeriodService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is Period {        
        return Type.HasKeys<Period>(obj, "Description", "Start", "Begin", "End");
    }
    public async CountAsync(): Promise<number> {
        
        return await this._context.Periods.CountAsync();
    }
    public async GetByIdAsync(id: number): Promise<Period | undefined> {       
        return await this._context.Periods.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }      
    public async AddAsync(obj: Period): Promise<Period> {

        this.CommomValidations(obj);

        return this._context.Periods.AddAsync(obj);
    }
    public async UpdateAsync(obj: Period): Promise<Period> {

        this.CommomValidations(obj);
        
        return this._context.Periods.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Period): Promise<Period> {
        return this._context.Periods.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Period[]> {
        return await this._context.Periods.OrderBy("Description").ToListAsync();
    }  

    
    private CommomValidations(obj : Period) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Period.name} type`);
        
        if(!obj.Begin)
            throw new InvalidEntityException(`Begin date is required`);

        if(!obj.Start)
            throw new InvalidEntityException(`Start time is required`);

        if(!obj.End)
            throw new InvalidEntityException(`End time is required`);
          
    }
}

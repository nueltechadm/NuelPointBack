import AbstractJorneyService from "../core/abstractions/AbstractJorneyService";
import Context from "../data/Context";
import {Inject} from'web_api_base';
import Journey from "../core/entities/Journey";
import Type from "../utils/Type";

export default class JourneyService  extends AbstractJorneyService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is Journey {     
        return Type.HasKeys<Journey>(obj, "Description", "Days");
    }    
    public async CountAsync(): Promise<number> {
        
        return await this._context.Journeys.CountAsync();
    }
    public async GetByIdAsync(id: number): Promise<Journey | undefined> {       
        return await this._context.Journeys.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }      
    public async AddAsync(obj: Journey): Promise<Journey> {
        return this._context.Journeys.AddAsync(obj);
    }
    public async UpdateAsync(obj: Journey): Promise<Journey> {
        return this._context.Journeys.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Journey): Promise<Journey> {
        return this._context.Journeys.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Journey[]> {
        return await this._context.Journeys.OrderBy("Description").ToListAsync();
    }  
}

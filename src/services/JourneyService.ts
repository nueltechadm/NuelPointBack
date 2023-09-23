import AbstractJorneyService from "../core/abstractions/AbstractJorneyService";
import Context from "../data/Context";
import {Inject} from'web_api_base';
import Journey from "../core/entities/Journey";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";

export default class JourneyService  extends AbstractJorneyService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Journey {     
        return Type.HasKeys<Journey>(obj, "Description");
    }    

    public override async CountAsync(): Promise<number> {
        
        return await this._context.Journeys.CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<Journey | undefined> {       
        return await this._context.Journeys.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }      

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Journeys.WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async AddAsync(obj: Journey): Promise<Journey> {

        this.ValidateObject(obj);

        return this._context.Journeys.AddAsync(obj);
    }

    public override async UpdateAsync(obj: Journey): Promise<Journey> {

        this.ValidateObject(obj);
        
        return this._context.Journeys.UpdateAsync(obj);
    }

    public override async GetByAndLoadAsync<K extends keyof Journey>(key: K, value: Journey[K], load: K[]): Promise<Journey[]> 
    {
       this._context.Journeys.Where({Field : key, Value : value});

       for(let l of load)
            this._context.Journeys.Join(l);
        
       return await this._context.Journeys.ToListAsync();
    } 

    
    public override async DeleteAsync(obj: Journey): Promise<Journey> {
        return this._context.Journeys.DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Journey[]> {
        return await this._context.Journeys.OrderBy("Description").ToListAsync();
    }  

    public override ValidateObject(obj : Journey) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Journey.name} type`);
        
               
    }
}




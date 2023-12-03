import AbstractJorneyService from "../core/abstractions/AbstractJorneyService";
import {Inject} from'web_api_base';
import Journey from "../core/entities/Journey";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import AbstractDBContext from "../data/abstract/AbstractDBContext";

export default class JourneyService  extends AbstractJorneyService
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

    public override IsCompatible(obj: any): obj is Journey {     
        return Type.HasKeys<Journey>(obj, "Description");
    }    

    public override async CountAsync(): Promise<number> {
        
        return await this._context.Collection(Journey).CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<Journey | undefined> {       
        return await this._context.Collection(Journey).WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }      

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Journey).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async AddAsync(obj: Journey): Promise<Journey> {

        this.ValidateObject(obj);

        return this._context.Collection(Journey).AddAsync(obj);
    }

    public override async UpdateAsync(obj: Journey): Promise<Journey> {

        this.ValidateObject(obj);
        
        return await this._context.Collection(Journey).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Journey>(obj: Journey, relations: U[]): Promise<Journey> {

        this.ValidateObject(obj);

        return await this._context.Collection(Journey).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public override async GetByAndLoadAsync<K extends keyof Journey>(key: K, value: Journey[K], load: K[]): Promise<Journey[]> 
    {
       this._context.Collection(Journey).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Journey).Join(l);
        
       return await this._context.Collection(Journey).ToListAsync();
    } 

    
    public override async DeleteAsync(obj: Journey): Promise<Journey> {
        return this._context.Collection(Journey).DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Journey[]> {
        return await this._context.Collection(Journey).OrderBy("Description").ToListAsync();
    }  

    public override ValidateObject(obj : Journey) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Journey.name} type`);
        
               
    }
}




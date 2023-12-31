import AbstractJorneyService from "@contracts/AbstractJorneyService";
import {Inject} from'web_api_base';
import Journey from "@entities/Journey";
import Type from "@utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from "@contracts/AbstractService";
import Departament from "@entities/Departament";

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

    public override async GetByAndLoadAsync<K extends keyof Journey>(key: K, value: Journey[K], load: (keyof Journey)[]): Promise<Journey[]> 
    {
       this._context.Collection(Journey).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Journey).Join(l);
        
       return await this._context.Collection(Journey).ToListAsync();
    } 

    
    public override async DeleteAsync(obj: Journey): Promise<Journey> {
        return this._context.Collection(Journey).DeleteAsync(obj);
    }


    public override async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<Journey>> 
    {
        let offset = (request.Page - 1) * request.Quantity;  

        let total = await this._context.Collection(Journey).CountAsync();

        let journeis = await this._context.Collection(Journey).OrderBy("Description").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<Journey>();
        result.Page = request.Page;
        result.Quantity = journeis.Count();
        result.Total = total;
        result.Result = journeis;

        return result;
    }


    public override ValidateObject(obj : Journey) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Journey.name} type`);
        
               
    }
}




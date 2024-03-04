import AbstractJorneyService, { JourneyPaginatedFilterRequest } from "@contracts/AbstractJorneyService";
import {Inject} from'web_api_base';
import Journey from "@entities/Journey";
import Type from "@utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from "@contracts/AbstractService";
import Departament from "@entities/Departament";
import { IJoinSelectable } from "myorm_core";
import Company from "@src/core/entities/Company";
import Time from "@src/core/entities/Time";
import DayOfWeek from "@src/core/entities/DayOfWeek";

export default class JourneyService  extends AbstractJorneyService
{
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public IsCompatible(obj: any): obj is Journey {     
        return Type.HasKeys<Journey>(obj, "Description");
    }    

    public async CountAsync(): Promise<number> {
        
        return await this._context.Collection(Journey).CountAsync();
    }

    public async GetByIdAsync(id: number): Promise<Journey | undefined> 
    {       
        let jouney = await this._context.Collection(Journey).WhereField("Id").IsEqualTo(id).Load("Company").Load("DaysOfWeek").FirstOrDefaultAsync();

        if(!jouney)
            return undefined;

        await this._context.Collection(DayOfWeek).ReloadCachedRealitionsAsync(jouney!.DaysOfWeek, ["Time"]);

        return jouney;        
    }      

    public async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Journey).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public async AddAsync(obj: Journey): Promise<Journey> {

        this.ValidateObject(obj);

        return this._context.Collection(Journey).AddAsync(obj);
    }

    public async UpdateAsync(obj: Journey): Promise<Journey> {

        this.ValidateObject(obj);
        
        return await this._context.Collection(Journey).UpdateAsync(obj);
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof Journey>(obj: Journey, relations: U[]): Promise<Journey> {

        this.ValidateObject(obj);

        return await this._context.Collection(Journey).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public async GetByAndLoadAsync<K extends keyof Journey>(key: K, value: Journey[K], load: (keyof Journey)[]): Promise<Journey[]> 
    {
       this._context.Collection(Journey).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Journey).Load(l);
        
       return await this._context.Collection(Journey).ToListAsync();
    } 

    
    public async DeleteAsync(obj: Journey): Promise<Journey> {
        return this._context.Collection(Journey).DeleteAsync(obj);
    }


    public async PaginatedFilterAsync(request : JourneyPaginatedFilterRequest) : Promise<PaginatedFilterResult<Journey>> 
    {
        let offset = (request.Page - 1) * request.Quantity;  

        let total = await this.BuildQuery(request).CountAsync();
        
        let query = this.BuildQuery(request);
        
        if(request.LoadRelations)
        {
            query.Load("Company");
        }

        let journeis = await query.OrderBy("Description").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<Journey>();
        result.Page = request.Page;
        result.Quantity = journeis.Count();
        result.Total = total;
        result.Result = journeis;

        return result;
    }

    private BuildQuery(request : JourneyPaginatedFilterRequest)  : IJoinSelectable<Journey>
    {
        let query = this._context.From(Journey)
                                 .LeftJoin(Company)
                                 .On(Journey, "Company", Company, "Id");
        

        if(request.CompanyId > 0)
            query.Where(Company, {Field: "Id", Value: request.CompanyId});


        return query.Select(Journey);
    } 


    public ValidateObject(obj : Journey) : void
    {
        if(!this.IsCompatible(obj))
            {throw new InvalidEntityException(`O objeto não é do tipo ${Journey.name}`);}

               
    }
}




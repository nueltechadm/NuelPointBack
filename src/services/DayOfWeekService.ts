import AbstractDayOfWeekService, { DayOfWeekPaginatedFilterRequest } from "@contracts/AbstractDayOfWeekService";
import {Inject} from'web_api_base'
import Type from "@utils/Type";
import DayOfWeek, { Days } from "@entities/DayOfWeek";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from "@contracts/AbstractService";
import { AbstractSet } from "myorm_core";



export default class DayOfWeekService  extends AbstractDayOfWeekService
{
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public IsCompatible(obj: any): obj is DayOfWeek {        
        return Type.HasKeys<DayOfWeek>(obj, "DayName");  
    }

    public async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.Collection(DayOfWeek).CountAsync();
    }

    public async GetByIdsAsync(ids: number[]): Promise<DayOfWeek[]> 
    {
        return await this._context.Collection(DayOfWeek).WhereField("Id").IsInsideIn(ids).ToListAsync();
    }

    public async GetByIdAsync(id: number): Promise<DayOfWeek | undefined> {       
        return await this._context.Collection(DayOfWeek).WhereField("Id").IsEqualTo(id).Load("Time").FirstOrDefaultAsync();
    }
    
    public async GetAllAsync(): Promise<DayOfWeek[]> {        
        return await this._context.Collection(DayOfWeek).OrderBy("DayName").ToListAsync();
    }


    public async AddAsync(obj: DayOfWeek): Promise<DayOfWeek> {

        this.ValidateObject(obj); 

        return this._context.Collection(DayOfWeek).AddObjectAndRelationsAsync(obj, []);
    }

    public async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(DayOfWeek).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public async GetByAndLoadAsync<K extends keyof DayOfWeek>(key: K, value: DayOfWeek[K], load: (keyof DayOfWeek)[]): Promise<DayOfWeek[]> 
    {
       this._context.Collection(DayOfWeek).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(DayOfWeek).Load(l);
        
       return await this._context.Collection(DayOfWeek).ToListAsync();
    } 

    public async UpdateAsync(obj: DayOfWeek): Promise<DayOfWeek> {

        this.ValidateObject(obj);

        return await this._context.Collection(DayOfWeek).UpdateAsync(obj);
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof DayOfWeek>(obj: DayOfWeek, relations: U[]): Promise<DayOfWeek> {

        this.ValidateObject(obj);

        return await this._context.Collection(DayOfWeek).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public async DeleteAsync(obj: DayOfWeek): Promise<DayOfWeek> 
    { 
        return this._context.Collection(DayOfWeek).DeleteAsync(obj);
    }

    
    public async PaginatedFilterAsync(request : DayOfWeekPaginatedFilterRequest) : Promise<PaginatedFilterResult<DayOfWeek>> 
    {
        let offset = (request.Page - 1) * request.Quantity;  

        let total = await this.BuildQuery(request).CountAsync();

        let departaments = await this.BuildQuery(request).OrderBy("DayName").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<DayOfWeek>();
        result.Page = request.Page;
        result.Quantity = departaments.Count();
        result.Total = total;
        result.Result = departaments;

        return result;
    }

    protected BuildQuery(request : DayOfWeekPaginatedFilterRequest) : AbstractSet<DayOfWeek>
    {
        let collection = this._context.Collection(DayOfWeek);

        if(request.Day != Days.ALL)
            collection.Where({Field: "Day", Value : request.Day});
        
        return collection;
    }

    public ValidateObject(obj: DayOfWeek) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${DayOfWeek.name} type`);

        if(!obj.DayName)
            throw new InvalidEntityException(`The name of ${DayOfWeek.name} is required`);

        if(obj.Day < Days.ALL || obj.Day > Days.SATURDAY)
            throw new InvalidEntityException(`Do not exists the day ${obj.Day}`);

        if(obj.Time !== undefined && obj.DayOff && obj.Time.Id > 0)
            throw new InvalidEntityException("time in days off are not alowed");
       
    }
}

import { Inject } from 'web_api_base';
import Type from "@utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Time from "@entities/Time";
import AbstractTimeService, { TimePaginatedFilterRequest } from "@contracts/AbstractTimeService";
import AbstractDBContext from '@data-contracts/AbstractDBContext';
import User from '@entities/User';
import { PaginatedFilterRequest, PaginatedFilterResult } from '@contracts/AbstractService';
import DayOfWeek from '@src/core/entities/DayOfWeek';
import AbstractSet from 'myorm_core/lib/objects/abstract/AbastractSet';
import { Operation } from 'myorm_core/lib/objects/interfaces/IStatement';



export default class TimeService extends AbstractTimeService {
   
    @Inject()
    private _context: AbstractDBContext;

    constructor(context: AbstractDBContext) {
        super();
        this._context = context;
    }

    public async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public IsCompatible(obj: any): obj is Time {
        return Type.HasKeys<Time>(obj, "Description", "Time1", "Time2", "Time3", "Time4");
    }


    public async CountAsync(): Promise<number> {
        return await this._context.Collection(Time).CountAsync();
    }


    public async ExistsAsync(id: number): Promise<boolean> {        
        return (await this._context.Collection(Time).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public async GetByAndLoadAsync<K extends keyof Time>(key: K, value: Time[K], load: (keyof Time)[]): Promise<Time[]> 
    {
       this._context.Collection(Time).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Time).Load(l);
        
       return await this._context.Collection(Time).ToListAsync();
    } 

    public async GetByIdAsync(id: number): Promise<Time | undefined> {
        return await this._context.Collection(Time).WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }     
    
    public async GetAllAsync(): Promise<Time[]> 
    {
        return await this._context.Collection(Time).OrderBy("Description").ToListAsync();
    } 

    public async AddAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);
        return this._context.Collection(Time).AddAsync(obj);
    }

    public async UpdateAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);
        return await this._context.Collection(Time).UpdateAsync(obj);
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof Time>(obj: Time, relations: U[]): Promise<Time> {

        this.ValidateObject(obj);

        return await this._context.Collection(Time).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public async DeleteAsync(obj: Time): Promise<Time> {
        return this._context.Collection(Time).DeleteAsync(obj);
    }

    protected BuildQuery(params : TimePaginatedFilterRequest) : AbstractSet<Time>
    {
        if(params.Description)
            this._context.Collection(Time).Where({Field: "Description", Kind : Operation.CONSTAINS, Value: params.Description});
        

        return this._context.Collection(Time);
    }


    public async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<Time>> 
    {
        let offset = (request.Page - 1) * request.Quantity; 

        let total = await this._context.Collection(Time).CountAsync();

        let times = await this.BuildQuery(request).Limit(request.Quantity).Offset(offset).ToListAsync(); 

        let result = new PaginatedFilterResult<Time>();
        result.Page = request.Page;
        result.Quantity = times.Count();
        result.Total = total;
        result.Result = times;

        return result;
    }

    public async GetByDayOfWeekAsync(userId: number, day: number): Promise<DayOfWeek | undefined> {
        
        let u = await this._context.Collection(User).WhereField("Id").IsEqualTo(userId).LoadRelationOn("Journey").FirstOrDefaultAsync();

        return u?.Journey?.DaysOfWeek.filter(s => s.Day == day).FirstOrDefault();
    }

    public ValidateObject(obj: Time): void {
        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Time.name} type`);

    }
}





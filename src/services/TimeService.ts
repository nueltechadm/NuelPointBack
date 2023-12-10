import { Inject } from 'web_api_base';
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Time from "../core/entities/Time";
import AbstractTimeService from "../core/abstractions/AbstractTimeService";
import AbstractDBContext from '../data/abstract/AbstractDBContext';
import User from '../core/entities/User';



export default class TimeService extends AbstractTimeService {
   
    @Inject()
    private _context: AbstractDBContext;

    constructor(context: AbstractDBContext) {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Time {
        return Type.HasKeys<Time>(obj, "Description", "Time1", "Time2", "Time3", "Time4");
    }


    public override async CountAsync(): Promise<number> {
        return await this._context.Collection(Time).CountAsync();
    }


    public override async ExistsAsync(id: number): Promise<boolean> {        
        return (await this._context.Collection(Time).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async GetByAndLoadAsync<K extends keyof Time>(key: K, value: Time[K], load: (keyof Time)[]): Promise<Time[]> 
    {
       this._context.Collection(Time).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Time).Join(l);
        
       return await this._context.Collection(Time).ToListAsync();
    } 

    public override async GetByIdAsync(id: number): Promise<Time | undefined> {
        return await this._context.Collection(Time).WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }     

    public override async AddAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);
        return this._context.Collection(Time).AddAsync(obj);
    }

    public override async UpdateAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);
        return await this._context.Collection(Time).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Time>(obj: Time, relations: U[]): Promise<Time> {

        this.ValidateObject(obj);

        return await this._context.Collection(Time).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public override async DeleteAsync(obj: Time): Promise<Time> {
        return this._context.Collection(Time).DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Time[]> {
        return await this._context.Collection(Time).OrderBy("Description").ToListAsync();
    }


    public override async GetByDayOfWeekAsync(userId: number, day: number): Promise<Time | undefined> {
        
        let u = await this._context.Collection(User).WhereField("Id").IsEqualTo(userId).LoadRelationOn("Journey").FirstOrDefaultAsync();

        let d = u?.Journey?.DaysOfWeek.filter(s => s.Day == day);

        if(d && d?.length > 0)
            return d[0].Time;
        else
            return undefined;

    }

    public override ValidateObject(obj: Time): void {
        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Time.name} type`);

    }
}





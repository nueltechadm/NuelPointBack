import { Inject } from 'web_api_base';
import Appointment from "../core/entities/Appointment";
import { Operation } from "myorm_core";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import AbstractAppointmentService  from "../core/abstractions/AbstractAppointmentService";
import User from "../core/entities/User";
import AbstractDBContext from "../data/abstract/AbstractDBContext";


export default class AppointmentService extends AbstractAppointmentService {
          

    @Inject()
    private _context: AbstractDBContext;

    constructor(context: AbstractDBContext) {
        super();
        this._context = context;
    }

    public async CountAsync(): Promise<number> {
        return await this._context.Collection(Appointment).CountAsync();
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Appointment {
        return  obj.constructor == Appointment && ("User" in obj || "UserId" in obj) && "Checkpoints" in obj;
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Appointment).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async GetByIdAsync(id: number): Promise<Appointment | undefined> {
        return await this._context.Collection(Appointment).WhereField("Id").IsEqualTo(id).LoadRelationOn("User").FirstOrDefaultAsync();
    }

    public override async AddAsync(obj: Appointment): Promise<Appointment> {

        this.ValidateObject(obj);

        if (!obj.User.Company)
            throw new InvalidEntityException(`The user of this Appointment has no company`);

        return this._context.Collection(Appointment).AddAsync(obj);
    }

    public override async UpdateAsync(obj: Appointment): Promise<Appointment> {

        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Appointment.name} type`);

        return await this._context.Collection(Appointment).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Appointment>(obj: Appointment, relations: U[]): Promise<Appointment> {

        this.ValidateObject(obj);

        return await this._context.Collection(Appointment).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public override async DeleteAsync(obj: Appointment): Promise<Appointment> {
        return this._context.Collection(Appointment).DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Appointment[]> {
        return await this._context.Collection(Appointment).OrderDescendingBy("Date").ToListAsync();
    }

    public override async GetByAndLoadAsync<K extends keyof Appointment>(key: K, value: Appointment[K], load: (keyof Appointment)[]): Promise<Appointment[]> 
    {
       this._context.Collection(Appointment).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Appointment).Join(l);
        
       return await this._context.Collection(Appointment).ToListAsync();
    } 


    public override async GetCurrentDayByUser(user: User): Promise<Appointment | undefined> {
        
        return await this._context.Collection(Appointment)
            .Where({
                Field: "User",
                Value: user!
            })
            .And({
                Field: "Date",
                Value: new Date()
            })            
            .Join("User")
            .Join("Checkpoints")
            .OrderDescendingBy("Date")
            .FirstOrDefaultAsync();
    }

    public override async GetByUserAndDates(user : User, start: Date, end: Date): Promise<Appointment[]> {
       

        return await this._context.Collection(Appointment)
            .Where({
                Field: "User",
                Value: user
            })
            .And({
                Field: "Date",
                Kind: Operation.GREATHEROREQUALS,
                Value: start
            })
            .And({
                Field: "Date",
                Kind: Operation.SMALLEROREQUALS,
                Value: end 
            })
            .Join("User")
            .Join("Checkpoints")
            .OrderDescendingBy("Date")
            .ToListAsync();
    }

    public override ValidateObject(obj: Appointment): void {
        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Appointment.name} type`);

        if (!obj.User)
            throw new InvalidEntityException(`User of Appointment is required`);        
    }

}

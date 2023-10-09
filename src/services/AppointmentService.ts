import Context from "../data/Context";
import { Inject } from 'web_api_base';
import Appointment from "../core/entities/Appointment";
import { Operation } from "myorm_pg";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import { AbstractAppointmentService } from "../core/abstractions/AbstractAppointmentService";
import User from "../core/entities/User";


export default class AppointmentService extends AbstractAppointmentService {
          

    @Inject()
    private _context: Context;

    constructor(context: Context) {
        super();
        this._context = context;
    }

    public async CountAsync(): Promise<number> {
        return await this._context.Checkpoints.CountAsync();
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Appointment {
        return ("User" in obj || "UserId" in obj) && "X" in obj && "Y" in obj;
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Appointments.WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async GetByIdAsync(id: number): Promise<Appointment | undefined> {
        return await this._context.Appointments.WhereField("Id").IsEqualTo(id).LoadRelationOn("User").FirstOrDefaultAsync();
    }

    public override async AddAsync(obj: Appointment): Promise<Appointment> {

        this.ValidateObject(obj);

        if (!obj.User.Company)
            throw new InvalidEntityException(`The user of this Appointment has no company`);

        return this._context.Appointments.AddAsync(obj);
    }

    public override async UpdateAsync(obj: Appointment): Promise<Appointment> {

        this.ValidateObject(obj);
        return await this._context.Appointments.UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Appointment>(obj: Appointment, relations: U[]): Promise<Appointment> {

        this.ValidateObject(obj);

        return await this._context.Appointments.UpdateObjectAndRelationsAsync(obj, relations);
    }

    public override async DeleteAsync(obj: Appointment): Promise<Appointment> {
        return this._context.Appointments.DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Appointment[]> {
        return await this._context.Appointments.OrderDescendingBy("Date").ToListAsync();
    }

    public override async GetByAndLoadAsync<K extends keyof Appointment>(key: K, value: Appointment[K], load: K[]): Promise<Appointment[]> 
    {
       this._context.Appointments.Where({Field : key, Value : value});

       for(let l of load)
            this._context.Appointments.Join(l);
        
       return await this._context.Appointments.ToListAsync();
    } 


    public override async GetCurrentDayByUser(user: User): Promise<Appointment | undefined> {
        
        return await this._context.Appointments
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
       

        return await this._context.Appointments
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

import Context from "../data/Context";
import { Inject } from 'web_api_base';
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Time from "../core/entities/Time";
import AbstractTimeService from "../core/abstractions/AbstractTimeService";



export default class TimeService extends AbstractTimeService {

    @Inject()
    private _context: Context;

    constructor(context: Context) {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Time {
        return Type.HasKeys<Time>(obj, "Description", "Time1", "Time2", "Time3", "Time4");
    }
    public override async CountAsync(): Promise<number> {

        return await this._context.Times.CountAsync();
    }
    public override async GetByIdAsync(id: number): Promise<Time | undefined> {
        return await this._context.Times.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    public override async AddAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);

        return this._context.Times.AddAsync(obj);
    }
    public override async UpdateAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);

        return this._context.Times.UpdateAsync(obj);
    }
    public override async DeleteAsync(obj: Time): Promise<Time> {
        return this._context.Times.DeleteAsync(obj);
    }
    public override async GetAllAsync(): Promise<Time[]> {
        return await this._context.Times.OrderBy("Description").ToListAsync();
    }

    public override ValidateObject(obj: Time): void {
        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Time.name} type`);

    }
}





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

    public override IsCompatible(obj: any): obj is Time {
        return Type.HasKeys<Time>(obj, "Description", "Time1", "Time2", "Time3", "Time4");
    }
    public async CountAsync(): Promise<number> {

        return await this._context.Times.CountAsync();
    }
    public async GetByIdAsync(id: number): Promise<Time | undefined> {
        return await this._context.Times.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    public async AddAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);

        return this._context.Times.AddAsync(obj);
    }
    public async UpdateAsync(obj: Time): Promise<Time> {

        this.ValidateObject(obj);

        return this._context.Times.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Time): Promise<Time> {
        return this._context.Times.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Time[]> {
        return await this._context.Times.OrderBy("Description").ToListAsync();
    }

    public ValidateObject(obj: Time): void {
        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Time.name} type`);

    }
}





import Context from "../data/Context";
import { Inject } from 'web_api_base';
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Access from "../core/entities/Access";
import { AbstractAcessService } from "../core/abstractions/AbstractAcessService";



export default class AcessService extends AbstractAcessService {

    @Inject()
    private _context: Context;

    constructor(context: Context) {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is Access {
        return Type.HasKeys<Access>(obj, "Username", "User");
    }
    public async CountAsync(): Promise<number> {

        return await this._context.Access.CountAsync();
    }
    public async GetByIdAsync(id: number): Promise<Access | undefined> {
        return await this._context.Access.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    public async AddAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Access.AddAsync(obj);
    }
    public async UpdateAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Access.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Access): Promise<Access> {
        return this._context.Access.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Access[]> {
        return await this._context.Access.OrderBy("Company").ToListAsync();
    }

    public ValidateObject(obj: Access): void {
        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Access.name} type`);

    }
}

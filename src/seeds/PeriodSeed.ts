import AbstractSeed from "./ISeed";
import Context from "../data/Context";
import Time from "../core/entities/Time";

export default class PeriodSeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    public async SeedAsync()
    {
        if((await this._context.Times.CountAsync()) > 0)
            return;

        await this._context.Times.AddAsync(new Time("Development periodo", "Some test journey", 8, 12, 13, 17));
    }
}
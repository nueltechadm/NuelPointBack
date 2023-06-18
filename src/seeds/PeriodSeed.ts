import AbstractSeed from "./ISeed";
import Context from "../data/Context";
import Period from "../core/entities/Period";

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
        if((await this._context.Periods.CountAsync()) > 0)
            return;

        await this._context.Periods.AddAsync(new Period("Development periodo", "Some test journey", 8.30, 17.45, new Date()));
    }
}
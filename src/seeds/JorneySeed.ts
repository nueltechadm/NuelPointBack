import AbstractSeed from "./ISeed";
import Jorney from "../core/entities/Journey";
import Context from "../data/Context";

export default class JorneySeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    public async SeedAsync()
    {
        if((await this._context.Journeys.CountAsync()) > 0)
            return;

        await this._context.Journeys.AddAsync(new Jorney("Development journey", "Some test journey", [1,2,3,4,5], (await this._context.Companies.FirstOrDefaultAsync())!));
    }
}
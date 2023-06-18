import AbstractSeed from "./ISeed";
import Company from "../core/entities/Company";
import Context from "../data/Context";

export default class CompanySeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    public async SeedAsync()
    {
        if((await this._context.Companies.CountAsync()) > 0)
            return;

        await this._context.Companies.AddAsync(new Company("Development","Development company"));
    }
}
import AbstractSeed from "./ISeed";
import Departament from "../core/entities/Departament";
import Context from "../data/Context";

export default class DepartamentSeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    public async SeedAsync()
    {
        if((await this._context.Departaments.CountAsync()) > 0)
            return;

        await this._context.Departaments.AddAsync(new Departament("Development", (await this._context.Companies.FirstOrDefaultAsync())!));
    }
}
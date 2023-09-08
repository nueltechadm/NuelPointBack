import AbstractSeed from "./ISeed";
import JobRole from "../core/entities/JobRole";
import Context from "../data/Context";

export default class JobRoleSeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    public async SeedAsync()
    {
        if((await this._context.JobRoles.CountAsync()) > 0)
            return;

        await this._context.JobRoles.AddAsync(new JobRole("Developer", (await this._context.Companies.FirstOrDefaultAsync())!, (await this._context.Departaments.FirstOrDefaultAsync())!));
    }
}
import AbstractSeed from "./ISeed";
import User from "../core/entities/User";
import Context from "../data/Context";

export default class UserSeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    
    public async SeedAsync()
    {

        if((await this._context.Users.CountAsync()) > 0)
            return;

        let adm = new User("Adriano Marino Balera", "adriano.marino1992@gmail.com", "adriano", "adriano", (await this._context.JobRoles.FirstOrDefaultAsync())!);
        adm.Permissions = await this._context.Permissions.ToListAsync();
        adm.Company = await this._context.Companies.FirstOrDefaultAsync();
        adm.Period = await this._context.Periods.FirstOrDefaultAsync();
        await this._context.Users.AddAsync(adm);
            
               
    }
}
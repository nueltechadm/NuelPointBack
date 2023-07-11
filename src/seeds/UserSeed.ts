import AbstractSeed from "./ISeed";
import User from "../core/entities/User";
import Access from "../core/entities/Access";
import Context from "../data/Context";
import { MD5 } from "../utils/Cryptography";

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

        let adm = new User("Adriano Marino Balera", "adriano.marino1992@gmail.com", (await this._context.JobRoles.FirstOrDefaultAsync())!);
        adm.Access = new Access(adm, "adriano", MD5("adriano"));
        adm.Access.Permissions = await this._context.Permissions.ToListAsync();
        adm.Company = await this._context.Companies.FirstOrDefaultAsync();
        adm.Period = await this._context.Periods.FirstOrDefaultAsync();
        await this._context.Users.AddAsync(adm);            
               
    }
}
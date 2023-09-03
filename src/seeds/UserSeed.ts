import AbstractSeed from "./ISeed";
import User from "../core/entities/User";
import Access from "../core/entities/Access";
import Context from "../data/Context";
import { MD5 } from "../utils/Cryptography";
import Address from "../core/entities/Address";
import Contact, { ContactType } from "../core/entities/Contact";

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
        adm.Access = new Access(adm, "adriano", MD5("adriano"), "Developer access");
        adm.Access!.Departaments = [(await this._context.Departaments.FirstOrDefaultAsync())!];        
        adm.Access.Permissions = await this._context.Permissions.ToListAsync();
        adm.Company = await this._context.Companies.FirstOrDefaultAsync();
        adm.Access.Company = adm.Company;
        adm.Period = await this._context.Times.FirstOrDefaultAsync();
        let address = new Address("Public area", "1234-A", "Vizinhança de teste", "teste de complemento", "12312000", "Jacareí", "SP");
        let contacts = 
        [
            new Contact("129888-6523", ContactType.PHONE),
            new Contact("teste@gmail.com", ContactType.EMAIL)
        ];

        adm.Address = address;
        adm.Contacts = contacts;
        await this._context.Users.AddAsync(adm);   
        
        
        let user = new User("Username", "username2@gmail.com", (await this._context.JobRoles.FirstOrDefaultAsync())!);
        user.Access = new Access(adm, "user", MD5("user"), "Some default user access");
        user.Access.Permissions = await this._context.Permissions.ToListAsync();
        user.Company = await this._context.Companies.FirstOrDefaultAsync();
        user.Period = await this._context.Times.FirstOrDefaultAsync();
        address = new Address("User area", "0101-A", "Company", "teste de complemento", "12312000", "Jacareí", "SP");
        contacts = 
        [
            new Contact("121234101010", ContactType.PHONE),
            new Contact("user@gmail.com", ContactType.EMAIL)
        ];

        user.Address = address;
        user.Contacts = contacts;
        await this._context.Users.AddAsync(user);      
               
    }
}
import AbstractSeed from "./ISeed";
import Company from "../core/entities/Company";
import Context from "../data/Context";
import Address from "../core/entities/Address";
import Contact, {ContactType} from "../core/entities/Contact";

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

        let company = new Company("Development","Development company", "123456789");
        let address = new Address("Public area", "1234-A", "Vizinhança de teste", "teste de complemento", "12312000", "Jacareí", "SP");
        let contacts = 
        [
            new Contact("129888-6523", ContactType.PHONE),
            new Contact("teste@gmail.com", ContactType.EMAIL)
        ];

        company.Address = address;
        company.Contacts = contacts;

        await this._context.Companies.AddAsync(company);
    }
}
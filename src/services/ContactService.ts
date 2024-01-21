import AbstractContactService from "@contracts/AbstractContactService";
import {Inject} from'web_api_base'
import Type from "@utils/Type";
import Contact from "@entities/Contact";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from "@contracts/AbstractService";
import { AbstractSet } from "myorm_core";



export default class ContactService  extends AbstractContactService
{
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is Contact {        
        return Type.HasKeys<Contact>(obj, "Contact");  
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override async CountAsync(): Promise<number> {
        
        return await this._context.Collection(Contact).CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<Contact | undefined> {       
        return await this._context.Collection(Contact).WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    
    public async GetAllAsync(): Promise<Contact[]> {        
        return await this._context.Collection(Contact).OrderBy("Contact").ToListAsync();
    }


    public override async AddAsync(obj: Contact): Promise<Contact> {

        this.ValidateObject(obj);      

        return this._context.Collection(Contact).AddObjectAndRelationsAsync(obj, []);
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Contact).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async GetByAndLoadAsync<K extends keyof Contact>(key: K, value: Contact[K], load: (keyof Contact)[]): Promise<Contact[]> 
    {
       this._context.Collection(Contact).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Contact).Load(l);
        
       return await this._context.Collection(Contact).ToListAsync();
    } 

    public override async UpdateAsync(obj: Contact): Promise<Contact> {

        this.ValidateObject(obj);

        return await this._context.Collection(Contact).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Contact>(obj: Contact, relations: U[]): Promise<Contact> {

        this.ValidateObject(obj);

        return await this._context.Collection(Contact).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public override async DeleteAsync(obj: Contact): Promise<Contact> {
        
        if(!obj.Id || obj == undefined)
            throw new InvalidEntityException(`Id is required to delete a ${Contact.name}`);

        let curr = await this._context.Collection(Contact).Where({ Field : "Id", Value : obj.Id}).FirstOrDefaultAsync();
        
        if(!curr)
            throw new EntityNotFoundException(`Has no one ${Contact.name} with Id #${obj.Id} in database`);

        return this._context.Collection(Contact).DeleteAsync(curr);
    }

    
    public override async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<Contact>> 
    {
        let offset = (request.Page - 1) * request.Quantity;  

        let total = await this.BuildQuery(request).CountAsync();

        let departaments = await this.BuildQuery(request).OrderBy("Contact").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<Contact>();
        result.Page = request.Page;
        result.Quantity = departaments.Count();
        result.Total = total;
        result.Result = departaments;

        return result;
    }

    protected BuildQuery(request : PaginatedFilterRequest) : AbstractSet<Contact>
    {
        let collection = this._context.Collection(Contact);

        //filters here
        
        return collection;
    }

    public override ValidateObject(obj: Contact) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${Contact.name} type`);

        if(!obj.Contact)
            throw new InvalidEntityException(`The name of ${Contact.name} is required`);
       
    }
}

import Context from "../data/Context";
import { Inject } from 'web_api_base';
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Access from "../core/entities/Access";
import { AbstractAccessService } from "../core/abstractions/AbstractAccessService";




export default class AcessService extends AbstractAccessService {
       
    @Inject()
    private _context: Context;

    constructor(context: Context) {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Access {
        return Type.HasKeys<Access>(obj, "Username", "User");
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Access.WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }
  
    
    public override async CountAsync(): Promise<number> {

        return await this._context.Access.CountAsync();
    }
    

    public override async GetByAndLoadAsync<K extends keyof Access>(key: K, value: Access[K], load: K[]): Promise<Access[]> 
    {
       this._context.Access.Where({Field : key, Value : value});

       for(let l of load)
            this._context.Access.Join(l);
        
       return await this._context.Access.ToListAsync();
    } 

    
    public override async GetByIdAsync(id: number): Promise<Access | undefined> {
        return await this._context.Access
        .WhereField("Id")
        .IsEqualTo(id)
        .LoadRelationOn("Company")
        .LoadRelationOn("Departaments")
        .LoadRelationOn("Permissions")
        .LoadRelationOn("User")
        .FirstOrDefaultAsync();
    }
    public override async AddAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Access.AddAsync(obj);
    }

    public override async UpdateAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Access.UpdateAsync(obj);
    }

    public override async DeleteAsync(obj: Access): Promise<Access> {
        return this._context.Access.DeleteAsync(obj);
    }
    
    public override async GetAllAsync(): Promise<Access[]> {
        return await this._context.Access.OrderBy("Company").ToListAsync();
    }

    public override ValidateObject(obj: Access): void {

        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Access.name} type`);

        if(!obj.Username)
            throw new InvalidEntityException(`The username of ${Access.name} is required`);

        if(!obj.Password)
            throw new InvalidEntityException(`The password of ${Access.name} is required`);

        if(!obj.Company?.Id)
            throw new InvalidEntityException(`The company of ${Access.name} is required`);

    }    

}


import { Inject } from 'web_api_base';
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Access from "../core/entities/Access";
import AbstractAccessService from "../core/abstractions/AbstractAccessService";
import AbstractDBContext from "../data/abstract/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from '../core/abstractions/AbstractService';




export default class AcessService extends AbstractAccessService {
       
    @Inject()
    private _context: AbstractDBContext;

    constructor(context: AbstractDBContext) {
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
        
        return (await this._context.Collection(Access).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }
  
    
    public override async CountAsync(): Promise<number> {

        return await this._context.Collection(Access).CountAsync();
    }
    

    public override async GetByAndLoadAsync<K extends keyof Access>(key: K, value: Access[K], load: K[]): Promise<Access[]> 
    {
       this._context.Collection(Access).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Access).Join(l);
        
       return await this._context.Collection(Access).ToListAsync();
    } 

    
    public override async GetByIdAsync(id: number): Promise<Access | undefined> {
        return await this._context.Collection(Access)
        .WhereField("Id")
        .IsEqualTo(id)        
        .LoadRelationOn("Permissions")
        .LoadRelationOn("User")
        .FirstOrDefaultAsync();
    }
    public override async AddAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Collection(Access).AddAsync(obj);
    }

    public override async UpdateAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Collection(Access).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Access>(obj: Access, relations: U[]): Promise<Access> {

        this.ValidateObject(obj);

        return await this._context.Collection(Access).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public override async DeleteAsync(obj: Access): Promise<Access> {
        return this._context.Collection(Access).DeleteAsync(obj);
    }
    
    public override async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<Access>> 
    {
        let offset = (request.Page - 1) * request.Quantity; 

        let total = await this._context.Collection(Access).CountAsync();

        let accesses = await this._context.Collection(Access).OrderBy("Username").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<Access>();
        result.Page = request.Page;
        result.Quantity = accesses.Count();
        result.Total = total;
        result.Result = accesses;

        return result;
    }

    public override ValidateObject(obj: Access): void {

        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Access.name} type`);

        if(!obj.Username)
            throw new InvalidEntityException(`The username of ${Access.name} is required`);

        if(!obj.Password)
            throw new InvalidEntityException(`The password of ${Access.name} is required`);
        

    }    

}


import { Inject } from 'web_api_base';
import Type from "@utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Access from "@entities/Access";
import AbstractAccessService from "@contracts/AbstractAccessService";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterRequest, PaginatedFilterResult } from '@contracts/AbstractService';




export default class AcessService extends AbstractAccessService {
       
    @Inject()
    private _context: AbstractDBContext;

    constructor(context: AbstractDBContext) {
        super();
        this._context = context;
    }

    public async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public IsCompatible(obj: any): obj is Access {
        return Type.HasKeys<Access>(obj, "Username", "User");
    }


    public async ExistsAsync(id: number): Promise<boolean> {
         
        return (await this._context.Collection(Access).Where({Field: "Id", Value : id}).CountAsync()) > 0;

    }
  
    
    public async CountAsync(): Promise<number> {

        return await this._context.Collection(Access).CountAsync();
    }
    

    public async GetByAndLoadAsync<K extends keyof Access>(key: K, value: Access[K], load: K[]): Promise<Access[]> 
    {
       this._context.Collection(Access).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Access).Load(l);
        
       return await this._context.Collection(Access).ToListAsync();
    } 

    public async GetByIdAsync(id: number): Promise<Access | undefined> {


        return await this._context.Collection(Access)
                                  .Where({Field:"Id", Value: id})
                                  .LoadRelationOn("User")
                                  .FirstOrDefaultAsync();
    }

    public async AddAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Collection(Access).AddAsync(obj);
    }

    public async UpdateAsync(obj: Access): Promise<Access> {

        this.ValidateObject(obj);

        return this._context.Collection(Access).UpdateAsync(obj);
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof Access>(obj: Access, relations: U[]): Promise<Access> {

        this.ValidateObject(obj);

        return await this._context.Collection(Access).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public async DeleteAsync(obj: Access): Promise<Access> {
        return this._context.Collection(Access).DeleteAsync(obj);
    }
    
    public async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<Access>> 
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

    public ValidateObject(obj: Access): void {

        if (!this.IsCompatible(obj))
            throw new InvalidEntityException(`Este objeto não é do tipo ${Access.name}`);

        if(!obj.Username)
            throw new InvalidEntityException(`O username do ${Access.name} é obrigatório`);

        if(!obj.Password)
            throw new InvalidEntityException(`O password do ${Access.name} é obrigatório`);
        

    }    

}


import AbstractDepartamentService, { DepartamentPaginatedRequest } from "@contracts/AbstractDepartamentService";
import {Inject} from'web_api_base'
import Type from "@utils/Type";
import Departament from "@entities/Departament";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterResult } from "@contracts/AbstractService";
import { AbstractSet } from "myorm_core";



export default class DepartamentService  extends AbstractDepartamentService
{
    
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is Departament {        
        return Type.HasKeys<Departament>(obj, "Description");  
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.Collection(Departament).CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<Departament | undefined> {       
        return await this._context.Collection(Departament).WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    
    public async GetAllAsync(): Promise<Departament[]> {        
        return await this._context.Collection(Departament).OrderBy("Description").ToListAsync();
    }


    public async AddAsync(obj: Departament): Promise<Departament> {

        this.ValidateObject(obj);      

        return this._context.Collection(Departament).AddObjectAndRelationsAsync(obj, []);
    }

    public async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Departament).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public async GetByAndLoadAsync<K extends keyof Departament>(key: K, value: Departament[K], load: (keyof Departament)[]): Promise<Departament[]> 
    {
       this._context.Collection(Departament).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Departament).Load(l);
        
       return await this._context.Collection(Departament).ToListAsync();
    } 

    public async UpdateAsync(obj: Departament): Promise<Departament> {

        this.ValidateObject(obj);

        return await this._context.Collection(Departament).UpdateAsync(obj);
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof Departament>(obj: Departament, relations: U[]): Promise<Departament> {

        this.ValidateObject(obj);

        return await this._context.Collection(Departament).UpdateObjectAndRelationsAsync(obj, relations);
    }

    public async DeleteAsync(obj: Departament): Promise<Departament> {
        
        if(!obj.Id || obj == undefined)
            throw new InvalidEntityException(`Id is required to delete a ${Departament.name}`);

        let curr = await this._context.Collection(Departament).Where({ Field : "Id", Value : obj.Id}).FirstOrDefaultAsync();
        
        if(!curr)
            throw new EntityNotFoundException(`Has no one ${Departament.name} with Id #${obj.Id} in database`);

        return this._context.Collection(Departament).DeleteAsync(curr);
    }

    
    public async PaginatedFilterAsync(request : DepartamentPaginatedRequest) : Promise<PaginatedFilterResult<Departament>> 
    {
        let offset = (request.Page - 1) * request.Quantity;  

        let total = await this.BuildQuery(request).CountAsync();

        let departaments = await this.BuildQuery(request).OrderBy("Description").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<Departament>();
        result.Page = request.Page;
        result.Quantity = departaments.Count();
        result.Total = total;
        result.Result = departaments;

        return result;
    }

    protected BuildQuery(request : DepartamentPaginatedRequest) : AbstractSet<Departament>
    {
        let collection = this._context.Collection(Departament);

        if(request.Description)
            collection.WhereField("Description").Constains(request.Description.Trim());

        return collection;
    }

    public ValidateObject(obj: Departament) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`O objeto não é do tipo ${Departament.name}`);

        if(!obj.Description)
            throw new InvalidEntityException(`O nome do ${Departament.name} é obrigatório`);
       
    }
}

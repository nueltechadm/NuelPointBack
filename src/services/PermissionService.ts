import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import Permission, {PermissionName} from "../core/entities/Permission";
import Type from "../utils/Type";
import InvalidEntityException from "../exceptions/InvalidEntityException";

export default class PermissionService  extends AbstractPermissionService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public override IsCompatible(obj: any): obj is Permission {
        return Type.HasKeys<Permission>(obj, "Description", "Name");
    }
    public override async CountAsync(): Promise<number> {
        
        return await this._context.Permissions.CountAsync();
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Permissions.WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }


    public override async GetByIdAsync(id: number): Promise<Permission | undefined> {       
        return await this._context.Permissions.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }


    public override async GetByNameAsync(name: PermissionName): Promise<Permission | undefined> {
        return await this._context.Permissions.WhereField("Name").IsEqualTo(name).OrderBy("Description").FirstOrDefaultAsync();
    }


    public override async GetByDescriptionAsync(description: string): Promise<Permission[]> {
        return await this._context.Permissions.WhereField("Description").Constains(description).OrderBy("Description").ToListAsync();
    }  
    
    public override async GetByAndLoadAsync<K extends keyof Permission>(key: K, value: Permission[K], load: K[]): Promise<Permission[]> 
    {
       this._context.Permissions.Where({Field : key, Value : value});

       for(let l of load)
            this._context.Permissions.Join(l);
        
       return await this._context.Permissions.ToListAsync();
    } 
    
    public override async AddAsync(obj: Permission): Promise<Permission> {
        return this._context.Permissions.AddAsync(obj);
    }


    public override async UpdateAsync(obj: Permission): Promise<Permission> {

        this.ValidateObject(obj);

        return await this._context.Permissions.UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Permission>(obj: Permission, relations: U[]): Promise<Permission> {

        this.ValidateObject(obj);

        return await this._context.Permissions.UpdateObjectAndRelationsAsync(obj, relations);
    }


    public override async DeleteAsync(obj: Permission): Promise<Permission> {
        return this._context.Permissions.DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Permission[]> {
        return await this._context.Permissions.OrderBy("Description").ToListAsync();
    }  

    public override ValidateObject(obj : Permission) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Permission.name} type`); 

        if(!obj.Description)
          throw new InvalidEntityException(`The description of permission is required`);

        if(!obj.Name)
          throw new InvalidEntityException(`The name of permission is required`);
    }
}

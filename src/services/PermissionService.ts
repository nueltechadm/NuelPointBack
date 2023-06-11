import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import Permission, {PermissionName} from "../core/entities/Permission";

export default class PermissionService  extends AbstractPermissionService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public IsCompatible(obj: any): obj is Permission {

        return "Description" in obj && "Name" in obj;  
    }

    public async GetByIdAsync(id: number): Promise<Permission | undefined> {       
        return await this._context.Permissions.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    public async GetByNameAsync(name: PermissionName): Promise<Permission | undefined> {
        return await this._context.Permissions.WhereField("Name").IsEqualTo(name).OrderBy("Description").FirstOrDefaultAsync();
    }
    public async GetByDescriptionAsync(description: string): Promise<Permission[]> {
        return await this._context.Permissions.WhereField("Description").Constains(description).OrderBy("Description").ToListAsync();
    }    
    public async AddAsync(obj: Permission): Promise<Permission> {
        return this._context.Permissions.AddAsync(obj);
    }
    public async UpdateAsync(obj: Permission): Promise<Permission> {
        return this._context.Permissions.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Permission): Promise<Permission> {
        return this._context.Permissions.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Permission[]> {
        return await this._context.Permissions.OrderBy("Description").ToListAsync();
    }  
}

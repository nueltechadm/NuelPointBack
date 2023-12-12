import Access from "../entities/Access";
import Permission, {PermissionName} from "../entities/Permission";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";



export default abstract class AbstractPermissionService extends AbstractService<Permission, PaginatedFilterRequest, PaginatedFilterResult<Permission>>
{
    abstract GetByIdAsync(id : number) : Promise<Permission | undefined>;
    abstract GetByNameAsync(name : PermissionName) : Promise<Permission | undefined>;
    abstract GetByDescriptionAsync(description : string) : Promise<Permission[]>;        
}


import Access from "@entities/Access";
import User from "@entities/User";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";



export default abstract class AbstractUserService extends AbstractService<User, UserPaginatedFilterRequest, PaginatedFilterResult<User>>
{
    abstract GetByIdAsync(id : number) : Promise<User | undefined>;
    abstract GetByNameAsync(name : string) : Promise<User[]>;
    abstract GetByUserNameAndPasswordAsync(username : string, password : string) : Promise<Access | undefined>;
    
   
}                               

export /*sealed */ class UserPaginatedFilterRequest extends PaginatedFilterRequest
{
    public DepartamentId : number = -1;
    public JobRoleId : number = -1;
    public CompanyId : number = -1;
    public Name : string = "";
    public LoadRelations : boolean = false;
}
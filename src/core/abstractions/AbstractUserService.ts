import Access from "@entities/Access";
import User from "@entities/User";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";
import JobRole from "../entities/JobRole";
import Departament from "../entities/Departament";
import Company from "../entities/Company";



export default abstract class AbstractUserService extends AbstractService<User, UserPaginatedFilterRequest, PaginatedFilterResult<User>>
{
    abstract GetByIdAsync(id : number) : Promise<User | undefined>;
    abstract GetByNameAsync(name : string) : Promise<User[]>;
    abstract GetByUserNameAndPasswordAsync(username : string, password : string) : Promise<Access | undefined>;
    abstract UnPaginatedFilterAsync(request : UserUnPaginatedFilterRequest) : Promise<UserUnPaginatedFilterResult<User>>;
   
}    


export /*sealed */ class UserPaginatedFilterRequest extends PaginatedFilterRequest
{
    public DepartamentId : number = -1;
    public JobRoleId : number = -1;
    public CompanyId : number = -1;
    public Name : string = "";
    public LoadRelations : boolean = false;
}

export /*sealed */ class UserUnPaginatedFilterRequest 
{
    public DepartamentId? : number = -1;
    public JobRoleId? : number = -1;
    public CompanyId? : number = -1;
    public Name? : string = "";
}

export class UserUnPaginatedFilterResult<T>
{
   Result : T[] = []; 
   Quantity : number = 10;

}
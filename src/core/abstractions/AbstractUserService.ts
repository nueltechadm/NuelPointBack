import Access from "@entities/Access";
import User from "@entities/User";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";



export default abstract class AbstractUserService extends AbstractService<User, PaginatedFilterRequest, PaginatedFilterResult<User>>
{
    abstract GetByIdAsync(id : number) : Promise<User | undefined>;
    abstract GetByNameAsync(name : string) : Promise<User[]>;
    abstract GetByUserNameAndPasswordAsync(username : string, password : string) : Promise<Access | undefined>;
   
}                               
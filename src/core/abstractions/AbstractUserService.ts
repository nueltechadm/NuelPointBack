import Access from "../entities/Access";
import Permission from "../entities/Permission";
import User from "../entities/User";
import AbstractService from "./AbstractService";



export default abstract class AbstractUserService extends AbstractService<User>
{
    abstract GetByIdAsync(id : number) : Promise<User | undefined>;
    abstract GetByNameAsync(name : string) : Promise<User[]>;
    abstract GetByUserNameAndPasswordAsync(username : string, password : string) : Promise<Access | undefined>;
    abstract GetByEmailAsync(email : string) : Promise<User | undefined>;
   
}                               
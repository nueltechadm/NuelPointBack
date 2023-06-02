import Employer from "../entities/Employer";
import AbstractService from "./AbstractService";

export default abstract class AbstractEmployerService extends AbstractService<Employer>
{
    abstract GetByIdAsync(id : number) : Promise<Employer | undefined>;
    abstract GetByNameAsync(name : string) : Promise<Employer[]>;
    abstract GetByEmailAsync(email : string) : Promise<Employer | undefined>;
    abstract GetByUserNameAndPasswordAsync(username: string, password : string): Promise<Employer | undefined>
}
import Company from "../entities/Company";
import AbstractService from "./AbstractService";

export default abstract class AbstractJobRoleService extends AbstractService<Company>
{
    abstract GetByIdAsync(id : number) : Promise<Company | undefined>;    
}
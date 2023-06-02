import JobRole from "../entities/JobRole";
import AbstractService from "./AbstractService";

export default abstract class AbstractJobRoleService extends AbstractService<JobRole>
{
    abstract GetByIdAsync(id : number) : Promise<JobRole | undefined>;    
}
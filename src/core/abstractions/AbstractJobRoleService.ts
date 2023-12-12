import JobRole from "../entities/JobRole";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractJobRoleService extends AbstractService<JobRole, PaginatedFilterRequest, PaginatedFilterResult<JobRole>>
{
    abstract GetByIdAsync(id : number) : Promise<JobRole | undefined>;    
}
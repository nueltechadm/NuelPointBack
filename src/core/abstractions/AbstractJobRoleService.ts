import JobRole from "../entities/JobRole";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractJobRoleService extends AbstractService<JobRole, JobRolePaginatedFilteRequest, PaginatedFilterResult<JobRole>>
{
    abstract GetByIdAsync(id : number) : Promise<JobRole | undefined>;    
}

export /* sealed */ class JobRolePaginatedFilteRequest extends PaginatedFilterRequest
{
    JobroleDescription? : string = "";
    DepartamentId? : number = -1;   

    constructor()
    {
        super();
    }
}
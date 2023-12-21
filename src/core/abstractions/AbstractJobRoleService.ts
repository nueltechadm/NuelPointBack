import JobRole from "../entities/JobRole";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractJobRoleService extends AbstractService<JobRole, JobRolePaginatedFilteRequest, PaginatedFilterResult<JobRole>>
{
    abstract GetByIdAsync(id : number) : Promise<JobRole | undefined>;    
}

export /* sealed */ class JobRolePaginatedFilteRequest extends PaginatedFilterRequest
{
    Description? : string = undefined;
    Departament? : number = undefined;   

    constructor()
    {
        super();
    }
}
import Access from "../entities/Access";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";



export default abstract class AbstractAccessService extends AbstractService<Access, PaginatedFilterRequest, PaginatedFilterResult<Access>>
{
    abstract GetByIdAsync(id: number): Promise<Access | undefined>;
    
}

import Access from "../entities/Access";
import Time from "../entities/Time";
import User from "../entities/User";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";



export default abstract class AbstractTimeService extends AbstractService<Time, PaginatedFilterRequest, PaginatedFilterResult<Time>>
{
    abstract GetByIdAsync(id: number): Promise<Time | undefined>;
    abstract GetByDayOfWeekAsync(userId : number, day: number): Promise<Time | undefined>;
}



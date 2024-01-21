import Time from "@entities/Time";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";
import DayOfWeek from "../entities/DayOfWeek";



export default abstract class AbstractTimeService extends AbstractService<Time, PaginatedFilterRequest, PaginatedFilterResult<Time>>
{
    abstract GetByIdAsync(id: number): Promise<Time | undefined>;
    abstract GetByDayOfWeekAsync(userId : number, day: number): Promise<DayOfWeek | undefined>;
    abstract GetAllAsync(): Promise<Time[]>;
}



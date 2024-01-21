import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";
import DayOfWeek, { Days } from "../entities/DayOfWeek";


export default abstract class AbstractDayOfWeekService extends AbstractService<DayOfWeek, PaginatedFilterRequest, PaginatedFilterResult<DayOfWeek>>
{
    abstract GetByIdAsync(id: number): Promise<DayOfWeek | undefined>;
}

export /*sealed */ class DayOfWeekPaginatedFilterRequest extends PaginatedFilterRequest
{    
    public Day : Days = Days.ALL;
}
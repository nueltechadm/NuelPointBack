import Time from "@entities/Time";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";
import DayOfWeek from "../entities/DayOfWeek";



export default abstract class AbstractTimeService extends AbstractService<Time, PaginatedFilterRequest, PaginatedFilterResult<Time>>
{
    abstract GetByIdAsync(id: number): Promise<Time | undefined>;
    abstract GetByDayOfWeekAsync(userId : number, day: number): Promise<DayOfWeek | undefined>;
    abstract GetAllAsync(): Promise<Time[]>;
}


export /*sealed*/ class TimePaginatedFilterRequest extends PaginatedFilterRequest
{
    Description? : string = "";
   

    constructor()
    {
        super();
    }
    
}


export /*sealed*/ class CompanyPaginatedFilterResponse extends PaginatedFilterResult<Time>
{
    constructor(times : Time[], quantity : number, total : number, page : number)
    {
        super();
        this.Page = page;
        this.Quantity = quantity;
        this.Total = total;
        this.Result = times;
    }
}
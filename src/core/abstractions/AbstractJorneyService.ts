import Journey from "@entities/Journey";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractJorneyService extends AbstractService<Journey, PaginatedFilterRequest, PaginatedFilterResult<Journey>>
{
    abstract GetByIdAsync(id : number) : Promise<Journey | undefined>;    
}



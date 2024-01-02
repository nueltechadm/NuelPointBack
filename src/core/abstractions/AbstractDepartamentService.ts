import Departament from "@entities/Departament";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractDepartamentService extends AbstractService<Departament, DepartamentPaginatedRequest, PaginatedFilterResult<Departament>>
{
    abstract GetByIdAsync(id : number) : Promise<Departament | undefined>;    
    abstract GetAllAsync() : Promise<Departament[]>;
}


export /* sealed */ class DepartamentPaginatedRequest extends PaginatedFilterRequest
{
    public Description : string = "";
}
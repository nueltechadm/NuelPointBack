import Departament from "../entities/Departament";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractDepartamentService extends AbstractService<Departament, PaginatedFilterRequest, PaginatedFilterResult<Departament>>
{
    abstract GetByIdAsync(id : number) : Promise<Departament | undefined>;    
}
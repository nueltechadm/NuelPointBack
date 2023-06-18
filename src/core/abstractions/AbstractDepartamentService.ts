import Departament from "../entities/Departament";
import AbstractService from "./AbstractService";

export default abstract class AbstractDepartamentService extends AbstractService<Departament>
{
    abstract GetByIdAsync(id : number) : Promise<Departament | undefined>;    
}
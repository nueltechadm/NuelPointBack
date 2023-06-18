import Period from "../entities/Period";
import AbstractService from "./AbstractService";

export default abstract class AbstractPeriodService extends AbstractService<Period>
{
    abstract GetByIdAsync(id : number) : Promise<Period | undefined>;    
}
import Time from "../entities/Time";
import AbstractService from "./AbstractService";

export default abstract class AbstractPeriodService extends AbstractService<Time>
{
    abstract GetByIdAsync(id : number) : Promise<Time | undefined>;    
}





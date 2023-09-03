import Time from "../entities/Time";
import User from "../entities/User";
import AbstractService from "./AbstractService";



export default abstract class AbstractTimeService extends AbstractService<Time>
{
    abstract GetByIdAsync(id: number): Promise<Time | undefined>;
    abstract GetByDayOfWeekAsync(userId : number, day: number): Promise<Time | undefined>;
}



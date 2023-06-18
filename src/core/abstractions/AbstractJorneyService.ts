import Journey from "../entities/Journey";
import AbstractService from "./AbstractService";

export default abstract class AbstractJorneyService extends AbstractService<Journey>
{
    abstract GetByIdAsync(id : number) : Promise<Journey | undefined>;    
}
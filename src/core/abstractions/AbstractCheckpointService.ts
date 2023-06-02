import Checkpoint from "../entities/Checkpoint";
import AbstractService from "./AbstractService";


export default abstract class AbstractCheckpointService extends AbstractService<Checkpoint>
{
    abstract GetByRangeAndEmployer(employer : number, begin : Date, end? : Date) : Promise<Checkpoint[]>;            
}


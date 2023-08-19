import Checkpoint from "../entities/Checkpoint";
import AbstractService from "./AbstractService";


export default abstract class AbstractCheckpointService extends AbstractService<Checkpoint>
{
    abstract GetByIdAsync(id : number) : Promise<Checkpoint | undefined>;
    abstract GetByRangeAndEmployer(employer : number, begin : Date, end? : Date) : Promise<Checkpoint[]>;    
    abstract GetFolderAndFileName(checkpoint : Checkpoint) : Promise<{ Folder : string, File : string}>;     
}


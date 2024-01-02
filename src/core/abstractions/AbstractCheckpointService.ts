import Checkpoint from "@entities/Checkpoint";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";


export default abstract class AbstractCheckpointService extends AbstractService<Checkpoint, PaginatedFilterRequest, PaginatedFilterResult<Checkpoint>>
{
    abstract GetByIdAsync(id : number) : Promise<Checkpoint | undefined>;
    abstract GetByRangeAndEmployer(employer : number, begin : Date, end? : Date) : Promise<Checkpoint[]>;    
    abstract GetFolderAndFileName(checkpoint : Checkpoint) : Promise<{ Folder : string, File : string}>;     
}


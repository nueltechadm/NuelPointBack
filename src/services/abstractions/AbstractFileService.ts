import Checkpoint from "../../core/entities/Checkpoint";

export default abstract class AbstractFileService 
{
    constructor(){}

    public abstract CopyAsync(origin: string, dest: string): Promise<void>;
    public abstract DeleteAsync(file: string): Promise<void>;
    public abstract GetAllFilesAsync(origin: string): Promise<string[]>;
    public abstract GetAllFordersAsync(origin: string): Promise<string[]>;
    public abstract FileExistsAsync(file: string): Promise<boolean>;
    public abstract DirectoryExistsAsync(path: string): Promise<boolean>;
    public abstract CreateDirectoryAsync(path: string): Promise<void>;
    public abstract GetStorageDirectory() : string;  
    public abstract ComputeDirectory(checkpoint : Checkpoint) : string;     
    public abstract ComputeNextFileNameAsync(checkpoint : Checkpoint) : Promise<string>;     
   
}




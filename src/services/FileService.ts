
import File from 'fs';
import FileAsync from 'fs/promises';
import Path from 'path';
import FileServiceBase from "./abstractions/AbstractFileService";
import { Application, ApplicationConfiguration, Exception } from 'web_api_base';
import Checkpoint from '../core/entities/Checkpoint';


export default class FileService extends FileServiceBase
{
   
    public override GetStorageDirectory(): string 
    {
       let dir = Path.join(Application.Configurations.RootPath, "disc");

       if(!this.DirectoryExistsAsync(dir))
            this.CreateDirectoryAsync(dir);

        return dir;
    }
       

    public override CreateDirectoryAsync(path: string): Promise<void> {

        return new Promise<void>(async (resolve, reject) => 
        {           
            try{

               if(!await this.DirectoryExistsAsync(path))
                    return resolve(File.mkdirSync(path));
                
                return resolve();

            }catch(err)
            {
               return reject(err);
            }
        });
    }
    
    public override FileExistsAsync(file: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => 
        {           
            try{

                return resolve(File.existsSync(file) && File.lstatSync(file).isFile());

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public override DirectoryExistsAsync(path: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => 
        {            
            try{
                
                return resolve(File.existsSync(path) && File.lstatSync(path).isDirectory());

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public override GetAllFilesAsync(origin: string): Promise<string[]> {
        
        return new Promise<string[]>(async (resolve, reject) => 
        {
            if(!File.existsSync(origin))
               return reject(new Error(`The path ${origin} not exists`));

            try{

            let files = await FileAsync.readdir(origin, {withFileTypes : true});

            return resolve(files.filter(u => u.isFile()).map(u => Path.join(origin, u.name)));

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public override GetAllFordersAsync(origin: string): Promise<string[]> {

        return new Promise<string[]>(async (resolve, reject) => 
        {
            if(!File.existsSync(origin))
                return reject(new Error(`The path ${origin} not exists`));

            try{

            let files = await FileAsync.readdir(origin, {withFileTypes : true});           

            return resolve(files.filter(u => u.isDirectory()).map(u => Path.join(origin, u.name)));

            }catch(err)
            {
                return  reject(err);
            }
        });
    }

    public override CopyAsync(origin: string, dest: string): Promise<void> {
     
        return new Promise<void>(async (resolve, reject)=>
        {
            try{
                await File.copyFile(origin, dest, (err) => 
                {
                    if(err) 
                        throw err;

                    resolve();
                })

            }catch(err)
            {
                reject(err);
            }
        });
        
    }      

    public override DeleteAsync(file: string): Promise<void> {
     
        return new Promise<void>(async (resolve, reject)=>
        {
            try{
                await File.unlink(origin, (err) => 
                {
                    if(err) 
                        throw err;

                    resolve();
                })

            }catch(err)
            {
                reject(err);
            }
        });
        
    }      


    public ComputeDirectory(checkpoint: Checkpoint): string {
       
        if(!checkpoint.User)
            throw new Exception("User is required to compute the checkpoint directory");

        if(!checkpoint.User.Company)
            throw new Exception("User's company is required to compute the checkpoint directory");

        let company = checkpoint.User.Company?.Id;
        let user = checkpoint.User.Id;
        let date = checkpoint.Date;
        let dateStr = `_${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        let path = Path.join(this.GetStorageDirectory(), `_${company}`, `_${user}`, dateStr);

        this.CreateDirectoryAsync(path);

        return path;

    }


    public async ComputeNextFileNameAsync(checkpoint: Checkpoint): Promise<string> {

        let path = this.ComputeDirectory(checkpoint);

        let files = await this.GetAllFilesAsync(path);

        let name = `_${files.Count() + 1}`;

        return Path.join(path, name);
    }
    
}




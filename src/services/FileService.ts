
import File from 'fs';
import FileAsync from 'fs/promises';
import Path from 'path';
import AbstractFileService from "./abstractions/AbstractFileService";
import { Application, ApplicationConfiguration, Exception } from 'web_api_base';
import Checkpoint from '@entities/Checkpoint';


export default class FileService extends AbstractFileService
{
      

    public override CreateDirectoryAsync(path: string): Promise<void> {

        return new Promise<void>(async (resolve, reject) => 
        {           
            try{

               if(!await this.DirectoryExistsAsync(path))
               {
                    File.mkdirSync(path, {recursive: true});
                    return resolve();
               }                    
                
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
                await File.unlink(file, (err) => 
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

    public override async GetStorageDirectoryAsync(): Promise<string> 
    {
       let dir = Application.Configurations.DEBUG ? 
       Path.join(Application.Configurations.RootPath, "dist", "storage") :
       Path.join(Application.Configurations.RootPath, "storage");

       if(!await this.DirectoryExistsAsync(dir))
            await this.CreateDirectoryAsync(dir);

        return dir;
    }
       


    public async ComputeDirectoryAsync(checkpoint: Checkpoint): Promise<string> {
       
        if(!checkpoint.User)
            throw new Exception("User is required to compute the checkpoint directory");

        if(!checkpoint.User.Company)
            throw new Exception("User's company is required to compute the checkpoint directory");

        let company = checkpoint.User.Company?.Id;
        let user = checkpoint.User.Id;
        let date = checkpoint.Date;
        let dateStr = `_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
        let path = Path.join(await this.GetStorageDirectoryAsync(), `_${company}`, `_${user}`, dateStr);

        await this.CreateDirectoryAsync(path);

        return path;

    }


    public async ComputeNextFileNameAsync(checkpoint: Checkpoint): Promise<string> {

        let path = await this.ComputeDirectoryAsync(checkpoint);

        let files = await this.GetAllFilesAsync(path);

        let name = `_${files.Count() + 1}`;

        return Path.join(path, name);
    }
    
}




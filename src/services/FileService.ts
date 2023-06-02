
import File from 'fs';
import FileAsync from 'fs/promises';
import Path from 'path';

import FileServiceBase from "./abstractions/AbstractFileService";


export default class FileService extends FileServiceBase
{
    

    public override CreateDirectory(path: string): Promise<void> {

        return new Promise<void>(async (resolve, reject) => 
        {           
            try{

               return resolve(File.mkdirSync(path));

            }catch(err)
            {
               return reject(err);
            }
        });
    }
    
    public override FileExists(file: string): Promise<boolean> {
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

    public override DirectoryExists(path: string): Promise<boolean> {
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

    public override GetAllFiles(origin: string): Promise<string[]> {
        
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

    public override GetAllForders(origin: string): Promise<string[]> {

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
        })
        
    }
    
}


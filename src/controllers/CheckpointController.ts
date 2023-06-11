
import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, Use, Validate } from "web_api_base";
import Formidable from "formidable";
import {IsLogged} from '../filters/AuthFilter';
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractFileService from "../services/abstractions/AbstractFileService";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import { InsertCheckpointDTO } from "../dto/InsertCheckpointDTO";


@Use(IsLogged)
@Validate()
export default class CheckpointController extends ControllerBase
{   
    @Inject()
    private _checkpointService : AbstractCheckpointService;

    @Inject()
    private _userService : AbstractUserService;

    @Inject()
    private _fileService : AbstractFileService;

    constructor(service : AbstractCheckpointService, fileService : AbstractFileService, userService : AbstractUserService)
    {
        super();                    
        this._checkpointService = service;
        this._userService = userService;
        this._fileService = fileService;
    }    
        
    
    @POST("insert")
    public async InsertAsync() : Promise<void>
    {  
        try{          

            Formidable({multiples : false}).parse(this.Request as any, async (err, fields, incomming) => 
            {                
                try{

                    if(err)
                        return this.Error(err);                    
                    
                    if(!fields.data || !this._checkpointService.IsCompatible(JSON.parse(fields.data.toString())))
                        return this.BadRequest(`The checkpoint data is required`);  
                        
                    let checkpointDTO = InsertCheckpointDTO.MapToDTO(JSON.parse(fields.data.toString()));                
        
                    let user = await this._userService.GetByIdAsync(checkpointDTO.UserId);
        
                    if(!user)
                        return this.BadRequest(`The user with Id #${checkpointDTO.UserId} not exists`);
                    
                    let checkpoint = checkpointDTO.MapToCheckpoint(user);
                    
                    await this._checkpointService.AddAsync(checkpoint);
                    
                    let info = await this._checkpointService.GetFolderAndFileName(checkpoint);

                    let temp = (incomming.file as Formidable.File).filepath;                    
                    
                    await this._fileService.CreateDirectory(info.Folder);

                    await this._fileService.CopyAsync(temp, info.File);

                    return this.Created();

                }
                catch(exception)
                {
                    if(exception instanceof InvalidEntityException)
                    {
                        return this.BadRequest(exception.message);
                    }
                    else if(exception instanceof EntityNotFoundException)
                    {
                        return this.BadRequest(exception.message);
                    }                    
                    else{

                        if(process.env.ENVIROMENT == "DEBUG")
                            return this.Error(exception);
                        else
                            return this.Error("Error while processing the request");
                    }
                }
                
            });
           

        }catch(exception)
        {
            if(process.env.ENVIROMENT == "DEBUG")
                 return this.Error(exception);
            else
                return this.Error("Error while processing the request");
            
        }
              
    }
    
   

   
}

import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, Use, Validate } from "web_api_base";
import CheckpointDTO from "../dto/CheckpointDTO";
import {IsLogged} from '../filters/AuthFilter';
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import Checkpoint from "../core/entities/Checkpoint";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractFileService from "../services/abstractions/AbstractFileService";
import EmployerService from "../services/EmployerService";
import AbstractEmployerService from "../core/abstractions/AbstractEmployerService";

@Use(IsLogged)
@Validate()
export default class CheckpointController extends ControllerBase
{   
    @Inject()
    private _checkpointService : AbstractCheckpointService;

    @Inject()
    private _employerService : AbstractEmployerService;

    @Inject()
    private _fileService : AbstractFileService;

    constructor(service : AbstractCheckpointService, fileService : AbstractFileService, employerService : AbstractEmployerService)
    {
        super();                    
        this._checkpointService = service;
        this._employerService = employerService;
        this._fileService = fileService;
    }    
        
    
    @POST("insert")
    public async InsertAsync(@FromBody()checkpoint : CheckpointDTO) : Promise<void>
    {  
        try{
          
           let employer = await this._employerService.GetByIdAsync(checkpoint.EmployerId);

           if(!employer)
                return this.BadRequest(`The employer with Id #${checkpoint.EmployerId} not exists`);
            
            let folder = employer.JobRole.Folder;
            let id = checkpoint.EmployerId;
            this.Request

        }catch(exception)
        {
            if(exception instanceof EntityNotFoundException)
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
              
    }
    
   

   
}
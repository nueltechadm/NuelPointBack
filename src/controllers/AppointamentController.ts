
import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, UseBefore, Validate, RunBefore } from "web_api_base";
import Formidable from "formidable";
import {IsLogged} from '../filters/AuthFilter';
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractFileService from "../services/abstractions/AbstractFileService";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import { CheckpointDTO } from "../dto/CheckpointDTO";
import Appointment  from "../core/entities/Appointment";
import { AbstractAppointmentService } from "../core/abstractions/AbstractAppointmentService";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";


@UseBefore(IsLogged)
@Validate()
export default class AppointamentController extends AbstractController
{
      
    @Inject()
    private _checkpointService : AbstractCheckpointService;

    @Inject()
    private _userService : AbstractUserService;


    @Inject()
    private _appointamentService : AbstractAppointmentService;

    @Inject()
    private _fileService : AbstractFileService;

    constructor(
        checkpoinService : AbstractCheckpointService, 
        fileService : AbstractFileService, 
        userService : AbstractUserService, 
        appointamentService : AbstractAppointmentService
        )
    {
        super();                    
        this._checkpointService = checkpoinService;
        this._userService = userService;
        this._fileService = fileService;
        this._appointamentService = appointamentService;
    }    
        
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._checkpointService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._appointamentService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._userService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }
    
    @POST("insert")    
    @SetDatabaseFromToken()
    public async InsertAsync() 
    {  
        try{          

            Formidable({multiples : false}).parse(this.Request as any, async (err, fields, incomming) => 
            {                
                try{

                    if(err)
                        return this.Error(err);                    
                    
                    if(!fields.data || !this._checkpointService.IsCompatible(JSON.parse(fields.data.toString())))
                        return this.BadRequest(`The checkpoint data is required`);  
                        
                    let checkpointDTO = CheckpointDTO.MapToDTO(JSON.parse(fields.data.toString()));                
        
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

    @PUT("update")    
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() appointament: Appointment) {
        try {

            this.OK(await this._appointamentService.UpdateAsync(appointament));
        }
        catch (ex) {
            if (ex instanceof InvalidEntityException || ex instanceof EntityNotFoundException)
                return this.BadRequest({ Message: ex.message });

            return this.Error("Error while processing the request");
        }
    }
    
    @GET("search")    
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() userId: number, @FromQuery() start : Date, @FromQuery() end : Date) {

        let user = await this._userService.GetByIdAsync(userId);

        if(!user)
            return this.BadRequest(`The user with Id #${userId} not exists`);

        let appointaments = await this._appointamentService.GetByUserAndDates(user, start, end);        

        this.OK(Type.RemoveORMMetadata(appointaments));
    }  


    @GET("getDay")    
    @SetDatabaseFromToken()
    public async GetCurrentDayByUserAsync(@FromQuery() userId : number) {

        let user = await this._userService.GetByIdAsync(userId);

        if(!user)
            return this.BadRequest(`The user with Id #${userId} not exists`);

        let appointament = await this._appointamentService.GetCurrentDayByUser(user);        

        this.OK(Type.RemoveORMMetadata(appointament));
    }  


    @GET("getAllDay")    
    @SetDatabaseFromToken()
    public async GetCurrentDayAsync(@FromQuery() company? : number) {        

        let appointament = await this._appointamentService.GetAllAsync();        

        this.OK(Type.RemoveORMMetadata(appointament));
    }  
   
}
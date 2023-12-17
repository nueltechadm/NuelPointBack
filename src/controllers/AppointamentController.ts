import { POST, PUT, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, RequestJson } from "web_api_base";
import {IsLogged} from '../filters/AuthFilter';
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import AbstractFileService from "../services/abstractions/AbstractFileService";
import AbstractUserService from "../core/abstractions/AbstractUserService";

import Appointment  from "../core/entities/Appointment";
import  AbstractAppointmentService  from "../core/abstractions/AbstractAppointmentService";
import Type from "../utils/Type";
import AbstractController from "./AbstractController";
import Authorization from "../utils/Authorization";
import SetDatabaseFromToken from "../decorators/SetDatabaseFromToken";
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import AbstractTimeService from "../core/abstractions/AbstractTimeService";
import Checkpoint from "../core/entities/Checkpoint";
import AppointmentDTO from "../dto/AppointmentDTO";
import AbstractMultiPartRequestService, { PartType } from "../services/abstractions/AbstractMultiPartRequestService";




@UseBefore(IsLogged)
@Validate()
export default class AppointamentController extends AbstractController
{
      
    @Inject()
    private _checkpointService : AbstractCheckpointService;

    @Inject()
    private _userService : AbstractUserService;

    @Inject()
    private _companyService : AbstractCompanyService;

    @Inject()
    private _timeService : AbstractTimeService;

    @Inject()
    private _appointamentService : AbstractAppointmentService;

    @Inject()
    private _fileService : AbstractFileService;



    @Inject()
    private _multiPartService : AbstractMultiPartRequestService;

    constructor(
        checkpoinService : AbstractCheckpointService, 
        fileService : AbstractFileService, 
        userService : AbstractUserService, 
        timeService : AbstractTimeService, 
        companyService : AbstractCompanyService,
        appointamentService : AbstractAppointmentService,
        multiPartService : AbstractMultiPartRequestService
        )
    {
        super();                    
        this._checkpointService = checkpoinService;
        this._userService = userService;
        this._companyService = companyService;
        this._timeService = timeService;
        this._fileService = fileService;
        this._appointamentService = appointamentService;
        this._multiPartService = multiPartService;
    }   
    
    
    @POST("insert")    
    @SetDatabaseFromToken()
    @AppointamentController.ProducesType(200, 'The just created Appointment object', AppointmentDTO)
    @AppointamentController.ProducesMessage(400, 'Error message', {Message : "The user with Id #${userId} not exists"})
    public async InsertAsync() : Promise<ActionResult> 
    {  
        
        let user = await this._userService.GetByIdAsync(this.Request.APIAUTH.UserId);

        if(!user)
            return this.BadRequest({Message : `The user with Id #${this.Request.APIAUTH.UserId} not exists`});         
        
        let parts = await this._multiPartService.GetPartsFromRequestAsync(this.Request);        

        if(
            parts.Any() && 
            parts.Any(s => s.Name == "Appointment" && s.Type == PartType.JSON) &&
            parts.Any(s => s.Name == "picture" && s.Type == PartType.FILE)
        )
            return this.BadRequest({Message : `Appointament field and picture are required`});
        
            
        let dto : AppointmentDTO = new  AppointmentDTO();
        let filePart = parts.First(s => s.Type == PartType.FILE);       
        
        try
        { 
            dto = parts.First(s => s.Name == "Appointament").Content.To<AppointmentDTO>();

        }catch
        { 
            return this.BadRequest(`The appointament field is not of type ${AppointmentDTO.name}`);
        }        

        let time = await this._timeService.GetByDayOfWeekAsync(user.Id, new Date().getDay());        

        let currentDayOfUser = await this._appointamentService.GetCurrentDayByUser(user);

        if(!currentDayOfUser)
            currentDayOfUser = new Appointment(user, time);

        let checkpoint = new Checkpoint(user, dto.X, dto.Y, user.Company!, currentDayOfUser, time);

        let image = await this._fileService.ComputeNextFileNameAsync(checkpoint);        

        await this._fileService.CopyAsync(filePart.Content, image);

        await this._fileService.DeleteAsync(filePart.Content);

        checkpoint.Picture = `${image}${filePart.Filename!.substring(filePart.Filename!.lastIndexOf('.'))}`;
 
        currentDayOfUser.Checkpoints.push(checkpoint);

        if(currentDayOfUser.Id <= 0)
            await this._appointamentService.AddAsync(currentDayOfUser);
        else
            await this._appointamentService.UpdateAsync(currentDayOfUser);        
        
        return this.OK(Type.RemoveAllRelationedObject(checkpoint));
    }



    @PUT("update")    
    @SetDatabaseFromToken()
    @RequestJson(JSON.stringify(Type.Delete(Type.CreateInstance(Appointment), 'Checkpoints')))
    @AppointamentController.ProducesMessage(200, 'Success message', {Message : 'Appointament updated'})
    @AppointamentController.ProducesMessage(400, 'Error message', {Message : 'Appointament with Id #${appointamentId} not exists'})
    public async UpdateAsync(@FromBody() appointament: Appointment) : Promise<ActionResult> 
    {
        if(appointament.Id <= 0)
            return this.BadRequest(`The property Id is required`);        

        await this._appointamentService.UpdateAsync(appointament);

        return this.OK({Message : 'Appointament updated'});
    }

    @PUT("update/checkpoints")    
    @SetDatabaseFromToken()
    @AppointamentController.ReceiveType(Checkpoint, true)
    @AppointamentController.ProducesMessage(200, 'Success message', {Message : 'Appointament updated'})
    @AppointamentController.ProducesMessage(400, 'Error message', {Message : 'Appointament with Id #${appointamentId} not exists'})
    public async UpdateCheckpoinsAsync(@FromBody() checkpoints: Checkpoint[], @FromQuery() appointamentId : number) : Promise<ActionResult> 
    {       

        let appointament = await this._appointamentService.GetByAndLoadAsync("Id", appointamentId, ["Checkpoints", "User"]);

        if(!appointament.Any())
            return this.NotFound(`Appointament with Id #${appointamentId} not exists`);

        appointament.First().Checkpoints = checkpoints;

        await this._appointamentService.UpdateAsync(appointament.First());

        return this.OK({Message : 'Appointament updated'});
    }

    
    @GET("search")    
    @SetDatabaseFromToken()
    @AppointamentController.ProducesMessage(200, 'Success message', {Message : 'Appointament updated'})
    @AppointamentController.ProducesMessage(400, 'Error message', {Message : 'The user with Id #${userId} not exists'})    
    public async GetByUserAndDatesAsync(@FromQuery() userId: number, @FromQuery() start : Date, @FromQuery() end : Date) : Promise<ActionResult>
    {
        let user = await this._userService.GetByIdAsync(userId);

        if(!user)
            return this.NotFound(`The user with Id #${userId} not exists`);

        let appointaments = await this._appointamentService.GetByUserAndDates(user, start, end);  
        
        if(!appointaments.Any())
            return this.NotFound({Message: `No one appointament found to user with Id #${userId} between ${start.toDateString()} and ${end.toDateString()}`});

        return this.OK(Type.RemoveFieldsRecursive(appointaments.First()));
    }  




    @GET("getDay")    
    @SetDatabaseFromToken()
    @AppointamentController.ProducesMessage(200, 'Success message', {Message : 'Appointament updated'})
    @AppointamentController.ProducesMessage(400, 'Error message', {Message : 'No one day is started by user with Id #${userId}'})  
    public async GetCurrentDayByUserAsync(@FromQuery() userId : number) : Promise<ActionResult>
    {

        let user = await this._userService.GetByIdAsync(userId);

        if(!user)
            return this.NotFound(`The user with Id #${userId} not exists`);

        let appointament = await this._appointamentService.GetCurrentDayByUser(user);  
        
        if(!appointament)
            return this.NotFound(`No one day is started by user with Id #${userId}`);

        Type.Delete(appointament, 'User');

        return this.OK(appointament);
    }  

    

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
       return this.OK(Type.CreateTemplateFrom<Appointment>(Appointment));
    }
   
}
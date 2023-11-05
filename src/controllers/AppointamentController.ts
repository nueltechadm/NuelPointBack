import { POST, PUT, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult } from "web_api_base";
import {IsLogged} from '../filters/AuthFilter';
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import AbstractFileService from "../services/abstractions/AbstractFileService";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import InvalidEntityException from "../exceptions/InvalidEntityException";

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

    constructor(
        checkpoinService : AbstractCheckpointService, 
        fileService : AbstractFileService, 
        userService : AbstractUserService, 
        timeService : AbstractTimeService, 
        companyService : AbstractCompanyService,
        appointamentService : AbstractAppointmentService
        )
    {
        super();                    
        this._checkpointService = checkpoinService;
        this._userService = userService;
        this._companyService = companyService;
        this._timeService = timeService;
        this._fileService = fileService;
        this._appointamentService = appointamentService;
    }   
    
    

        
    public override async SetClientDatabaseAsync(): Promise<void> {
        await this._checkpointService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._appointamentService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._userService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        await this._timeService.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
    }


    
    @POST("insert")    
    @SetDatabaseFromToken()
    @AppointamentController.ProducesType(200, "The just created Appointment object", Appointment)
    @AppointamentController.ProducesMessage(400, "A message telling what is missing", {Message : "The user with ID 1 not exists"})
    public async InsertAsync(@FromBody()dto : AppointmentDTO) : Promise<ActionResult> 
    {  
        
        let user = await this._userService.GetByIdAsync(this.Request.APIAUTH.UserId);

        if(!user)
            return this.BadRequest({Message : `The user with ID #${this.Request.APIAUTH.UserId} not exists`});       

        let time = await this._timeService.GetByDayOfWeekAsync(user.Id, new Date().getDay());

        if(!time)
            return this.BadRequest({Message : `No one time is registered`});

        let currentDayOfUser = await this._appointamentService.GetCurrentDayByUser(user);

        if(!currentDayOfUser)
            currentDayOfUser = new Appointment(time, user);

        currentDayOfUser.Checkpoints.push(new Checkpoint(user, dto.X, dto.Y, dto.Picture, user.Company!, time));

        if(currentDayOfUser.Id <= 0)
            await this._appointamentService.AddAsync(currentDayOfUser);
        else
            await this._appointamentService.UpdateAsync(currentDayOfUser);

        return this.OK(currentDayOfUser);
              
    }




    @PUT("update")    
    @SetDatabaseFromToken()
    public async UpdateAsync(@FromBody() appointament: Appointment) : Promise<ActionResult> 
    {
        return this.OK(await this._appointamentService.UpdateAsync(appointament));
    }



    
    @GET("search")    
    @SetDatabaseFromToken()
    public async GetByIdAsync(@FromQuery() userId: number, @FromQuery() start : Date, @FromQuery() end : Date) : Promise<ActionResult>
    {

        let user = await this._userService.GetByIdAsync(userId);

        if(!user)
            return this.BadRequest(`The user with Id #${userId} not exists`);

        let appointaments = await this._appointamentService.GetByUserAndDates(user, start, end);        

        return this.OK(Type.RemoveORMMetadata(appointaments));
    }  




    @GET("getDay")    
    @SetDatabaseFromToken()
    public async GetCurrentDayByUserAsync(@FromQuery() userId : number) : Promise<ActionResult>
    {

        let user = await this._userService.GetByIdAsync(userId);

        if(!user)
            return this.BadRequest(`The user with Id #${userId} not exists`);

        let appointament = await this._appointamentService.GetCurrentDayByUser(user);        

        return this.OK(appointament);
    }  

    

    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson() : ActionResult
    {
       return this.OK(Type.CreateTemplateFrom<Appointment>(Appointment));
    }
   
}
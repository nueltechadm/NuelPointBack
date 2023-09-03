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
import AbstractCompanyService from "../core/abstractions/AbstractCompanyService";
import AbstractTimeService from "../core/abstractions/AbstractTimeService";
import Checkpoint from "../core/entities/Checkpoint";


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
    }
    
    @POST("insert")    
    @SetDatabaseFromToken()
    public async InsertAsync(@FromBody()dto : {x : number, y : number, picture : string}) 
    {  
        
        let user = await this._userService.GetByIdAsync(this.Request.APIAUTH.User);

        if(!user)
            return this.BadRequest(`The user with Id #${this.Request.APIAUTH.User} not exists`);       

        let time = await this._timeService.GetByDayOfWeekAsync(user.Id, new Date().getDay());

        if(!time)
            return this.BadRequest(`No one time is registered`);

        let currentDayOfUser = await this._appointamentService.GetCurrentDayByUser(user);

        if(!currentDayOfUser)
            currentDayOfUser = new Appointment(time, user);

        currentDayOfUser.Checkpoints.push(new Checkpoint(user, dto.x, dto.y, dto.picture, user.Company!, time));

        if(currentDayOfUser.Id <= 0)
            await this._appointamentService.AddAsync(currentDayOfUser);
        else
            await this._appointamentService.UpdateAsync(currentDayOfUser);

        this.Created({Message : "Checkpoint created"});
              
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
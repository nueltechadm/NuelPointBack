import { POST, PUT, GET, Inject, FromBody, FromQuery, UseBefore, Validate, ActionResult, RequestJson, Description } from "web_api_base";
import { IsLogged } from '@filters/AuthFilter';
import AbstractCheckpointService from "@contracts/AbstractCheckpointService";
import AbstractFileService from "@non-core-contracts/AbstractFileService";
import AbstractUserService from "@contracts/AbstractUserService";
import Appointment from "@entities/Appointment";
import AbstractAppointmentService from "@contracts/AbstractAppointmentService";
import Type from "@utils/Type";
import AbstractController from "./AbstractController";
import SetDatabaseFromToken from "@decorators/SetDatabaseFromToken";
import AbstractCompanyService from "@contracts/AbstractCompanyService";
import AbstractTimeService from "@contracts/AbstractTimeService";
import Checkpoint from "@entities/Checkpoint";
import AppointmentDTO from "../dto/AppointmentDTO";
import fs from 'fs';
import FileCastException from "@src/exceptions/FileCastException";
import User from "@src/core/entities/User";



@UseBefore(IsLogged)
@Validate()
export default class AppointamentController extends AbstractController
{

    @Inject()
    private _checkpointService: AbstractCheckpointService;

    @Inject()
    private _userService: AbstractUserService;

    @Inject()
    private _companyService: AbstractCompanyService;

    @Inject()
    private _timeService: AbstractTimeService;

    @Inject()
    private _appointamentService: AbstractAppointmentService;

    @Inject()
    private _fileService: AbstractFileService;




    constructor(
        checkpoinService: AbstractCheckpointService,
        fileService: AbstractFileService,
        userService: AbstractUserService,
        timeService: AbstractTimeService,
        companyService: AbstractCompanyService,
        appointamentService: AbstractAppointmentService
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


    @POST("insert")
    @SetDatabaseFromToken()
    @AppointamentController.ReceiveType(AppointmentDTO)
    @AppointamentController.ProducesType(200, 'O Apontamento recém-criado', AppointmentDTO)
    @AppointamentController.ProducesMessage(400, 'Mensagem de erro', { Message: "O usuário com Id ${userId} não existe" })
    @Description(`Utilize esse metodo para inserir um apontamento`)
    public async InsertAsync(@FromBody() dto: AppointmentDTO): Promise<ActionResult> 
    {
        let user = (await this._userService.GetByIdAsync(this.Request.APIAUTH.UserId))!;

        let currentDayOfUser = await this._appointamentService.GetCurrentDayByUserAsync(user);

        if (!currentDayOfUser)
            currentDayOfUser = new Appointment(user);

        let checkpoint = new Checkpoint(user, dto.X, dto.Y, currentDayOfUser, user.Company, this.Request.APIAUTH.Link);

        let image = await this._fileService.ComputeNextFileNameAsync(checkpoint);

        try
        {

            await this._fileService.SaveImageFromBase64Async(image, dto.File);

        } catch (e)
        {
            if (e instanceof FileCastException)
                return this.BadRequest('imagem base64 inválida');
        }

        checkpoint.Picture = image;

        currentDayOfUser.Checkpoints.push(checkpoint);

        if (currentDayOfUser.Id <= 0)
            await this._appointamentService.AddAsync(currentDayOfUser);
        else
            await this._appointamentService.UpdateAsync(currentDayOfUser);

        return this.OK(Type.RemoveAllRelationedObject(checkpoint));

    }





    @GET("get-appointaments")
    @AppointamentController.ProducesType(200, 'Lista de todos apontamentos registrados', AppointmentDTO)
    @SetDatabaseFromToken()
    @Description(`Utilize esse metodo visualizar uma lista apontamentos`)
    public async GetAppointaments(@FromQuery() userId: number, @FromQuery() init: Date, @FromQuery() end: Date): Promise<ActionResult> 
    {
        let appointaments: Appointment[] = [];

        let user = (await this._userService.GetByAndLoadAsync("Id", userId, ["Journey"])).FirstOrDefault();

        if (!user)
            return this.BadRequest(`Usuário com Id ${userId} não existe`);

        appointaments.AddRange(await this._appointamentService.GetByDatesAsync(init, end));

        let journey = user.Journey;

        if (!journey)
            return this.BadRequest(`Usuário não possui jornada`);

        let result = {} as any;
        result["Appointaments"] = [];

        for (let u of appointaments.GroupBy(s => s.User.Name))
        {
            for (let d of u.Values.GroupBy(s => s.Date).OrderBy(s => s.Key))
            {
                let dayOfWeek = journey.DaysOfWeek.First(s => s.Day == (d.Key as Date).getDay());

                result["Appointaments"].push({
                    Date: d.Key,
                    DayOfWeek: dayOfWeek,
                    Points: d.Values.SelectMany(s => s.Checkpoints)
                });
            }
        }

        return this.OK(result);
    }






    @PUT("update")
    @SetDatabaseFromToken()
    @RequestJson(JSON.stringify(Type.Delete(Type.CreateInstance(Appointment), 'Checkpoints')))
    @AppointamentController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Apontamento Atualizado' })
    @AppointamentController.ProducesMessage(400, 'Mensgem de erro', { Message: 'Apontamento com Id #${appointamentId} não existe' })
    @Description(`Utilize esse metodo atualizar um apontamento`)
    public async UpdateAsync(@FromBody() appointament: Appointment): Promise<ActionResult> 
    {
        if (appointament.Id <= 0)
            return this.BadRequest(`O ID é obrigatório`);

        await this._appointamentService.UpdateAsync(appointament);

        return this.OK({ Message: 'Apontamento atualizado' });
    }





    @PUT("update/checkpoints")
    @SetDatabaseFromToken()
    @AppointamentController.ReceiveType(Checkpoint, true)
    @AppointamentController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Apontamento atualizado' })
    @AppointamentController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Apontamento com Id #${appointamentId} não existe' })
    @Description(`Utilize esse metodo para atualizar um ponto de um apontamento`)
    public async UpdateCheckpoinsAsync(@FromBody() checkpoints: Checkpoint[], @FromQuery() appointamentId: number): Promise<ActionResult> 
    {

        let appointament = await this._appointamentService.GetByAndLoadAsync("Id", appointamentId, ["Checkpoints", "User"]);

        if (!appointament.Any())
            return this.NotFound(`Apontamento com Id #${appointamentId} não existe`);

        appointament.First().Checkpoints = checkpoints;

        await this._appointamentService.UpdateAsync(appointament.First());

        return this.OK({ Message: 'Apontamento atualizado' });
    }


    

    @GET("search")
    @SetDatabaseFromToken()
    @AppointamentController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Apontamento atualizado' })
    @AppointamentController.ProducesMessage(400, 'Mensagem de erro', { Message: 'O usuário com Id #${userId} não existe' })
    @Description(`Utilize esse metodo para visualizar um apontamento especifico`)
    public async GetByUserAndDatesAsync(@FromQuery() userId: number, @FromQuery() start: Date, @FromQuery() end: Date): Promise<ActionResult>
    {
        let user = await this._userService.GetByIdAsync(userId);

        if (!user)
            return this.NotFound(`O usuário com Id #${userId} não existe`);

        let appointaments = await this._appointamentService.GetByUserAndDatesAsync(user, start, end);

        if (!appointaments.Any())
            return this.NotFound({ Message: `Nenhum apontamento encontrado para o usuário com Id #${userId} entre ${start.toDateString()} e ${end.toDateString()}` });

        return this.OK(Type.RemoveFieldsRecursive(appointaments.First()));
    }




    @GET("getDay")
    @SetDatabaseFromToken()
    @AppointamentController.ProducesMessage(200, 'Mensagem de sucesso', { Message: 'Apontamento atualizado' })
    @AppointamentController.ProducesMessage(400, 'Mensagem de erro', { Message: 'Nenhum dia é iniciado pelo usuário com Id #${userId}' })
    @Description(`Utilize esse metodo para visualizar um apontamento de um dia especifico`)
    public async GetCurrentDayByUserAsync(@FromQuery() userId: number): Promise<ActionResult>
    {

        let user = await this._userService.GetByIdAsync(userId);

        if (!user)
            return this.NotFound(`O usuário com Id #${userId} não existe`);

        let appointament = await this._appointamentService.GetCurrentDayByUserAsync(user);

        if (!appointament)
            return this.NotFound(`Nenhum dia é iniciado pelo usuário com Id #${userId}`);

        Type.Delete(appointament, 'User');

        return this.OK(appointament);
    }



    @GET("getJson")
    @SetDatabaseFromToken()
    public GetJson(): ActionResult
    {
        return this.OK(Type.CreateTemplateFrom<Appointment>(Appointment));
    }

}
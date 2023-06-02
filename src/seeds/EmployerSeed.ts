import AbstractSeed from "./ISeed";
import AbstractEmployerService from "../core/abstractions/AbstractEmployerService";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import Employer from "../core/entities/Employer";
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import Checkpoint from "../core/entities/Checkpoint";

export default class EmployerSeed extends AbstractSeed
{
    private _employerService : AbstractEmployerService;
    private _jobRoleService : AbstractJobRoleService;
    private _checkpointService : AbstractCheckpointService

    constructor(
        userService : AbstractEmployerService, 
        permissionService : AbstractJobRoleService,
        checkpointService : AbstractCheckpointService)
    {
        super();
        this._employerService = userService;
        this._jobRoleService = permissionService;
        this._checkpointService = checkpointService;
    }
    public async SeedAsync()
    {
        let adm = new Employer("Adriano Marino Balera", "adriano.marino1992@gmail.com", "adriano", "adriano", (await this._jobRoleService.GetAllAsync())[0]);        

        if((await this._employerService.GetByNameAsync(adm.Name)).length != 0)
            return;

        await this._employerService.AddAsync(adm);
        await this._checkpointService.AddAsync(new Checkpoint(adm, 0,0, "C:\\Imagens\\ponto"));
               
    }
}
import AbstractSeed from "./ISeed";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";
import JobRole from "../core/entities/JobRole";

export default class JobRoleSeed extends AbstractSeed
{
    private _service : AbstractJobRoleService;

    constructor(service : AbstractJobRoleService)
    {
        super();
        this._service = service;
    }
    public async SeedAsync()
    {
        if((await this._service.GetAllAsync()).length > 0)
            return;

            await this._service.AddAsync(new JobRole("Developer", "developers"));
    }
}
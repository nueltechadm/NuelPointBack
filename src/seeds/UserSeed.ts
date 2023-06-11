import AbstractSeed from "./ISeed";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import User from "../core/entities/User";
import JobRole from "../core/entities/JobRole";
import AbstractJobRoleService from "../core/abstractions/AbstractJobRoleService";

export default class UserSeed extends AbstractSeed
{
    private _userService : AbstractUserService;
    private _permissionService : AbstractPermissionService;
    private _jobRoleService : AbstractJobRoleService;
    

    constructor(userService : AbstractUserService, permissionService : AbstractPermissionService, jobRoleService : AbstractJobRoleService)
    {
        super();
        this._userService = userService;
        this._permissionService = permissionService;
        this._jobRoleService = jobRoleService;
    }
    public async SeedAsync()
    {
        let adm = new User("Adriano Marino Balera", "adriano.marino1992@gmail.com", "adriano", "adriano", (await this._jobRoleService.GetAllAsync())[0]);
        adm.Permissions = await this._permissionService.GetAllAsync();

        if((await this._userService.GetByNameAsync(adm.Name)).length == 0)
            await this._userService.AddAsync(adm);
               
    }
}
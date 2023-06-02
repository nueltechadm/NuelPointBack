import AbstractSeed from "./ISeed";
import AbstractUserService from "../core/abstractions/AbstractUserService";
import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import User from "../core/entities/User";

export default class UserSeed extends AbstractSeed
{
    private _userService : AbstractUserService;
    private _permissionService : AbstractPermissionService;
    

    constructor(userService : AbstractUserService, permissionService : AbstractPermissionService)
    {
        super();
        this._userService = userService;
        this._permissionService = permissionService;
    }
    public async SeedAsync()
    {
        let adm = new User("Adriano Marino Balera", "adriano.marino1992@gmail.com", "adriano", "adriano");
        adm.Permissions = await this._permissionService.GetAllAsync();

        if((await this._userService.GetByNameAsync(adm.Name)).length == 0)
            await this._userService.AddAsync(adm);
               
    }
}
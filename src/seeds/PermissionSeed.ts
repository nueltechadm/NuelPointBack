import AbstractSeed from "./ISeed";
import AbstractPermissionService from "../core/abstractions/AbstractPermissionService";
import Permission, { PermissionName } from "../core/entities/Permission";

export default class PermissionSeed extends AbstractSeed
{
    private _service : AbstractPermissionService;

    constructor(service : AbstractPermissionService)
    {
        super();
        this._service = service;
    }
    public async SeedAsync()
    {
        if((await this._service.GetAllAsync()).length > 0)
            return;

        let permissions = 
        [
            new Permission(PermissionName.EMPLOYERS, "Access the employers control"), 
            new Permission(PermissionName.PERMISSIONS, "Access the permission control"),
            new Permission(PermissionName.USERS, "Access the user control"),
            new Permission(PermissionName.JOBS, "Access the jobs control")
        ]

        for(let p of permissions)
        {
            await this._service.AddAsync(p);
        }
    }
}
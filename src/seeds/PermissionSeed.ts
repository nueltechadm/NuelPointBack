import AbstractSeed from "./ISeed";
import Permission, { PermissionName } from "../core/entities/Permission";
import Context from "../data/Context";

export default class PermissionSeed extends AbstractSeed
{
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }
    
    public async SeedAsync()
    {
        if((await this._context.Permissions.CountAsync()) > 0)
            return;

        let permissions = 
        [             
            new Permission(PermissionName.PERMISSIONS, "Access the permission control"),
            new Permission(PermissionName.USERS, "Access the user control"),
            new Permission(PermissionName.JOBS, "Access the jobs control")
        ]

        for(let p of permissions)
        {
            await this._context.Permissions.AddAsync(p);
        }
    }
}
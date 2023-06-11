import {Table, Column, DataType, PrimaryKey, DBTypes} from 'myorm_pg'; 


@Table()
export default class Permission
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()    
    public Name : PermissionName;

    @Column()
    public Description : string;   

    constructor(name : PermissionName, description : string)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;
    }
}


export enum PermissionName
{    
    USERS = "USERS_CONTROLLER",
    PERMISSIONS = "PERMISSIONS_CONTROLLER",
    JOBS = "JOBS_CONTROLLERS"
}
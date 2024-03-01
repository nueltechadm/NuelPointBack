import { Column, DataType, PrimaryKey, DBTypes, Table } from 'myorm_pg';


@Table("database_tb")
export default class Database {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    public Name: string;    

    @Column()
    public Version: string; 

    @Column()
    @DataType(DBTypes.DATE)
    public LasUpdate?: Date; 

    @Column()
    @DataType(DBTypes.DATE)
    public CreatedAt: Date; 

    @Column()
    public Observation: string;

    @Column()
    public Warning: string;

    @Column()
    public Status: DababaseStatus;

    constructor(name: string) {

        this.Id = -1;
        this.CreatedAt = new Date();
        this.LasUpdate = undefined;
        this.Version = "1.0.0";
        this.Warning = "";
        this.Name = name;
        this.Status = DababaseStatus.CREATING;
        this.Observation = ""
    }

    public IsValid() : boolean
    {
        return this.Status == DababaseStatus.CREATED || this.Status == DababaseStatus.UPDATED;
    }
}

export enum DababaseStatus {
    CREATING = "creating",
    CREATED = "created",
    DELETED = "deleted", 
    CREATEFAIL = "creation fail", 
    UPDATING = "updating", 
    UPDATED = "updated",
    UPDATEFAIL = "update fail"
}

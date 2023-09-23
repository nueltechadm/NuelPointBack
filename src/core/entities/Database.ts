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
}

export enum DababaseStatus {
    CREATING = 1,
    CREATED = 2,
    DELETED = 3, 
    CREATEFAIL = 4, 
    UPDATING = 5, 
    UPDATED = 6,
    UPDATEFAIL = 7
}

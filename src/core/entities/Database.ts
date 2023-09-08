import { Column, DataType, PrimaryKey, DBTypes } from 'myorm_pg';

export default class Database {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    public Name: string;    

    @Column()
    public Observation: string;

    @Column()
    public Status: DababaseStatus;

    constructor(name: string) {

        this.Id = -1;
        this.Name = name;
        this.Status = DababaseStatus.CREATING;
        this.Observation = ""
    }
}

export enum DababaseStatus {
    CREATING = 1,
    CREATED = 2,
    DELETED = 3, 
    CREATEFAIL = 4
}

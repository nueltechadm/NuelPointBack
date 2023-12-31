import {Table, Column, DataType, PrimaryKey, DBTypes, OneToOne, ManyToOne} from 'myorm_pg'; 
import User from './User';
import Company from './Company';
import Time from './Time';
import Appointment from './Appointment';


@Table("checkpoint_tb")
export default class Checkpoint
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    @DataType(DBTypes.DATETIME)
    public Date : Date;    

    @Column()
    @OneToOne(()=> User)
    public User : User;

    @Column()
    public Observation : string;

    @Column()
    public CheckpointType : CheckpointType;

    @Column()
    public X : number;

    @Column()
    public Y : number;

    @Column()
    public Picture? : string;

    @Column()
    @ManyToOne(() => Appointment)
    public Appointment : Appointment;

    @Column()
    @ManyToOne(() => Company)
    public Company : Company;

    @Column()
    @ManyToOne(() => Time)
    public Time? : Time;
    
    constructor(user : User, x : number, y : number, company : Company, appointament : Appointment, time? : Time)
    {
        this.Id = -1;
        this.Date = new Date();
        this.User = user;
        this.X = x;
        this.Y = y;
        this.Picture = undefined;
        this.Company = company;
        this.Appointment = appointament;
        this.Time = time;
        this.Observation = "";
        this.CheckpointType = CheckpointType.NORMAL;
    }
}


export enum CheckpointType
{
    NORMAL = 0, 
    EDIT = 1, 
    DELETE = 2, 
    NULL = 9999
}



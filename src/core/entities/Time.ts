import {Table, Column, DataType, PrimaryKey, DBTypes} from 'myorm_pg'; 
import DayOfWeek from './DayOfWeek';


@Table("time_tb")
export default class Time
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;    

    @Column()
    public Description : string;      

    @Column()
    public DayOfweek? : DayOfWeek;

    @Column()
    @DataType(DBTypes.DOUBLE)
    public Time1 : number;   

    @Column()
    @DataType(DBTypes.DOUBLE)
    public Time2 : number; 

    @Column()
    @DataType(DBTypes.DOUBLE)
    public Time3 : number; 

    @Column()
    @DataType(DBTypes.DOUBLE)
    public Time4 : number; 

    constructor(description : string,  time1 : number, time2 : number, time3 : number , time4 : number)
    {
        this.Id = -1;        
        this.Description = description;
        this.Time1 = time1;
        this.Time2 = time2;
        this.Time3 = time3;
        this.Time4 = time4;
        this.DayOfweek = undefined;
    }
}


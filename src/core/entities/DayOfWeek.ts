import { Column, DataType, PrimaryKey, DBTypes, Table, OneToMany, ManyToOne } from 'myorm_pg';
import Time from './Time';
import Journey from './Journey';

@Table("dayofweek_tb")
export default class DayOfWeek {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    @DataType(DBTypes.INTEGER)
    public Day: Days;  
    
    @Column()    
    public DayName: string;  

    @Column()
    @ManyToOne(() => Journey)
    public Journey : Journey;
    
    @Column()   
    public Time: Time; 

    @Column()
    public DayOff: boolean;

    constructor(day: Days, name : string, time: Time, journey : Journey) {
        this.Id = -1;
        this.DayOff = false;
        this.DayName = name,
        this.Day = day;       
        this.Time = time;
        this.Journey = journey;
    }

}

export enum Days
{
    ALL = -1,
    SUNDAY = 0,
    MONDAY = 1, 
    TUESDAY = 2, 
    WEDNESDAY = 3, 
    THURSDAY = 4, 
    FRIDAY = 5, 
    SATURDAY = 6
}


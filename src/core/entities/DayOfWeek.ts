import { Column, DataType, PrimaryKey, DBTypes } from 'myorm_pg';
import Time from './Time';



export default class DayOfWeek {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    @DataType(DBTypes.INTEGER)
    public Day: number;

    @Column()
    public Time: Time;


    @Column()
    public DayOff: boolean;


    constructor(day: number, time: Time) {
        this.Id = -1;
        this.DayOff = false;
        this.Day = day;
        this.Time = time;
    }


}

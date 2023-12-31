import { Column, DataType, PrimaryKey, DBTypes, Table } from 'myorm_pg';
import Time from './Time';

@Table("dayofweek_tb")
export default class DayOfWeek {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    @DataType(DBTypes.INTEGER)
    public Day: number;    

    @Column()
    public DayOff: boolean;

    constructor(day: number, time: Time) {
        this.Id = -1;
        this.DayOff = false;
        this.Day = day;       
    }


}

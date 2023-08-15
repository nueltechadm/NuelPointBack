import { Table, Column, DataType, PrimaryKey, DBTypes, ManyToOne, OneToMany } from 'myorm_pg';
import Time from './Time';
import Checkpoint from './Checkpoint';



@Table("appointament_tb")
export class Appointment {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;


    @Column()
    @ManyToOne(() => Time)
    public Time: Time;

    @Column()
    @OneToMany(() => Checkpoint)
    public Checkpoints: Checkpoint[];

    @Column()
    public DayOfWeek: DayOfWeek;

    public constructor(time: Time) {
        this.Id = -1;
        this.Checkpoints = [];
        this.DayOfWeek = new Date().getDay() as DayOfWeek;
        this.Time = time;
    }


}

export enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6

}

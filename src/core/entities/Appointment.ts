import { Table, Column, DataType, PrimaryKey, DBTypes, ManyToOne, OneToMany, OneToOne } from 'myorm_pg';
import Time from './Time';
import Checkpoint from './Checkpoint';
import User from './User';



@Table("appointament_tb")
export default class Appointment {
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    @DataType(DBTypes.DATE)
    public Date : Date; 

    @Column()
    @OneToMany(() => Checkpoint)
    public Checkpoints: Checkpoint[];

    @Column()
    public DayOfWeek: DayOfWeek;

    @Column()
    @OneToOne(()=> User)
    public User : User;

    public constructor(user : User) {
        this.Id = -1;
        this.Checkpoints = [];
        this.DayOfWeek = new Date().getDay() as DayOfWeek;        
        this.Date = new Date();
        this.User = user;
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

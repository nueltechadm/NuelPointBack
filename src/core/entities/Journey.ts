import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToMany, ManyToOne} from 'myorm_pg'; 
import Company from './Company';
import DayOfWeek from './DayOfWeek';
import Time from './Time';


@Table("journey_tb")
export default class Journey
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;   

    @Column()
    public Description : string;   

    @Column()
    @ManyToOne(() => Company)
    public Company : Company;

   @Column()
   @OneToMany(() => DayOfWeek)
   public DaysOfWeek : DayOfWeek[];

    constructor(description : string, company : Company)
    {
        this.Id = -1;      
        this.Description = description;       
        this.Company = company;
        this.DaysOfWeek = [];
    }
}




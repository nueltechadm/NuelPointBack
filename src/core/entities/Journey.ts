import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToMany, ManyToOne} from 'myorm_pg'; 
import Company from './Company';
import DayOfWeek from './DayOfWeek';


@Table()
export default class Journey
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()    
    public Name : string;

    @Column()
    public Description : string;   

    @Column()
    @ManyToOne(() => Company)
    public Company : Company;

   @Column()
   @OneToMany(() => DayOfWeek)
   public DaysOfWeek : DayOfWeek[];

    constructor(name : string, description : string, days : number[], company : Company)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;       
        this.Company = company;
        this.DaysOfWeek = [];
    }
}




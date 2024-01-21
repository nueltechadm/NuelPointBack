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
    public Time1 : string;   

    @Column()   
    public Time2 : string; 

    @Column()    
    public Time3 : string; 

    @Column()   
    public Time4 : string; 

    @Column()    
    public Time5 : string; 

    @Column()    
    public Time6 : string; 

    constructor(description : string)
    {
        this.Id = -1;        
        this.Description = description;
        this.Time1 = "00:00";
        this.Time2 = "00:00";
        this.Time3 = "00:00";
        this.Time4 = "00:00";
        this.Time5 = "00:00";
        this.Time6 = "00:00";        
    }
}


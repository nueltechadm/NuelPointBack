import {Table, Column, DataType, PrimaryKey, DBTypes} from 'myorm_pg'; 


@Table()
export default class Time
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

    constructor(name : string, description : string,  time1 : number, time2 : number, time3 : number , time4 : number)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;
        this.Time1 = time1;
        this.Time2 = time2;
        this.Time3 = time3;
        this.Time4 = time4;
    }
}


import {Table, Column, DataType, PrimaryKey, DBTypes} from 'myorm_pg'; 


@Table()
export default class Period
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
    public Begin : Date;

    @Column()
    public Over? : Date;

    @Column()
    public Start : number;

    @Column()
    public End : number;

    constructor(name : string, description : string, start : number, end : number, begin : Date, over? : Date)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;
        this.Start = start;
        this.End = end;
        this.Begin = begin;
        this.Over = over;
    }
}


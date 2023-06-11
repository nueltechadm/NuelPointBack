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
    public Start : number;

    @Column()
    public End : number;

    constructor(name : string, description : string, start : number, end : number)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;
        this.Start = start;
        this.End = end;
    }
}


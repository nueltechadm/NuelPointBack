import {Table, Column, DataType, PrimaryKey, DBTypes} from 'myorm_pg'; 


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
    @DataType(DBTypes.INTEGERARRAY)
    public Days : number[];

    constructor(name : string, description : string, days : number[])
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;
        this.Days = days;
    }
}


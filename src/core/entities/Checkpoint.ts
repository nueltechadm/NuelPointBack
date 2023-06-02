import {Table, Column, DataType, PrimaryKey, DBTypes, OneToOne} from 'myorm_pg'; 
import Employer from './Employer';


@Table()
export default class Checkpoint
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    @DataType(DBTypes.DATETIME)
    public Date : Date;    

    @Column()
    @OneToOne(()=> Employer)
    public Employer : Employer;

    @Column()
    public X : Number;

    @Column()
    public Y : Number;

    @Column()
    public Picture : string;
    
    constructor(employer : Employer, x : number, y : number, picture : string)
    {
        this.Id = -1;
        this.Date = new Date();
        this.Employer = employer;
        this.X = x;
        this.Y = y;
        this.Picture = picture;
    }
}
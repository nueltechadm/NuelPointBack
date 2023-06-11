import {Table, Column, DataType, PrimaryKey, DBTypes, OneToOne} from 'myorm_pg'; 
import User from './User';



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
    @OneToOne(()=> User)
    public User : User;

    @Column()
    public X : number;

    @Column()
    public Y : number;

    @Column()
    public Picture : string;
    
    constructor(user : User, x : number, y : number, picture : string)
    {
        this.Id = -1;
        this.Date = new Date();
        this.User = user;
        this.X = x;
        this.Y = y;
        this.Picture = picture;
    }
}
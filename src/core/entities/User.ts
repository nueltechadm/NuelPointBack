import {Table, Column, DataType, PrimaryKey, DBTypes, ManyToMany} from 'myorm_pg'; 
import Permission from './Permission';

@Table("user_tb")
export default class User
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;
    
    @Column()
    public Name : string;
    
    @Column()
    public Email : string;
    
    @Column()
    public Username : string;
    
    @Column()
    public Password : string;    
   
    @Column()
    @ManyToMany(() => Permission)
    public Permissions : Permission[];

    constructor(name : string, email : string, username : string, password : string)
    {
        this.Id = -1;
        this.Name = name;
        this.Email = email;
        this.Username = username;
        this.Password = password; 
        this.Permissions = [];
    }
}
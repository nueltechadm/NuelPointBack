import {Table, Column, DataType, PrimaryKey, DBTypes, ManyToMany, ManyToOne, OneToOne, OneToMany} from 'myorm_pg'; 
import Permission from './Permission';
import Company from './Company';
import Departament from './Departament';
import User from './User';

@Table("access_tb")
export default class Access
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;
    
    @Column()
    @OneToOne(() => User)
    public User : User;

    @Column()
    public Description : string;

    @Column()
    public Username : string;
    
    @Column()
    public Password : string;    
   
    @Column()
    @ManyToMany(() => Permission)
    public Permissions : Permission[];  


    constructor(user : User, username : string, password : string, description? : string)
    {
        this.Id = -1;  
        this.User = user;      
        this.Username = username;
        this.Password = password;        
        this.Permissions = [];        
        this.Description = description ?? "";        
    }
}
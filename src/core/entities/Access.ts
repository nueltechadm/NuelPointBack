import {Table, Column, DataType, PrimaryKey, DBTypes, OneToOne} from 'myorm_pg'; 
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
    public Username : string;
    
    @Column()
    public Password : string;      
    

    @Column()    
    public Perfil : PERFILTYPE;


    constructor(user : User, username : string, password : string, perfil : PERFILTYPE)
    {
        this.Id = -1;  
        this.User = user;      
        this.Username = username;
        this.Password = password;        
        this.Perfil = perfil;
    }
}


export enum PERFILTYPE
{    
    USER = "USER",
    ADM = "ADM",
    SUPER = "SUPER"
}
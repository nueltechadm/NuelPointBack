import {Table, Column, DataType, PrimaryKey, DBTypes, ManyToMany, ManyToOne} from 'myorm_pg'; 
import Permission from './Permission';
import JobRole from './JobRole';
import Company from './Company';
import Period from './Period';

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

    @Column()
    @ManyToOne(()=> JobRole, "Users")
    public JobRole: JobRole;

    @Column()
    @ManyToOne(() => Company)
    public Company? : Company;

    @Column()
    @ManyToOne(() => Period)
    public Period? : Period;

    constructor(name : string, email : string, username : string, password : string, job : JobRole)
    {
        this.Id = -1;
        this.Name = name;
        this.Email = email;
        this.Username = username;
        this.Password = password;
        this.JobRole = job; 
        this.Permissions = [];
        this.Company = undefined;
        this.Period = undefined;
    }
}
import {Table, Column, DataType, PrimaryKey, DBTypes, ManyToMany, ManyToOne} from 'myorm_pg'; 
import Permission from './Permission';
import JobRole from './JobRole';
import Company from './Company';
import Period from './Period';
import Access from './Access';

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
    @DataType(DBTypes.DATE)
    public Birthdate : Date;

    @Column()
    @DataType(DBTypes.DATE)
    public AdmisionDate : Date;

    @Column()
    @DataType(DBTypes.DATE)
    public DemissionDate? : Date;
    
    @Column()
    public Email : string; 

    @Column()
    @ManyToOne(()=> JobRole, "Users")
    public JobRole: JobRole;

    @Column()
    @ManyToOne(() => Company)
    public Company? : Company;

    @Column()
    @ManyToOne(() => Period)
    public Period? : Period;

    @Column()
    @ManyToOne(() => Access)
    public Access? : Access;

    constructor(name : string, email : string, job : JobRole)
    {
        this.Id = -1;
        this.Name = name;
        this.Birthdate = new Date();
        this.AdmisionDate = new Date();
        this.DemissionDate = undefined;
        this.Email = email;        
        this.JobRole = job;         
        this.Company = undefined;
        this.Period = undefined;
        this.Access = undefined;
    }
}
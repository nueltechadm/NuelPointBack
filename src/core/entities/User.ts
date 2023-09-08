import {Table, Column, DataType, PrimaryKey, DBTypes, ManyToMany, ManyToOne, OneToMany, OneToOne} from 'myorm_pg'; 
import JobRole from './JobRole';
import Company from './Company';
import Access from './Access';
import Contact from './Contact';
import Address from './Address';
import Journey from './Journey';

@Table("user_tb")
export default class User
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;
    
    @Column()
    public Active : boolean;

    @Column()
    public Name : string;

    @Column()
    @DataType(DBTypes.DATE)
    public Birthdate : Date;

    @Column()
    public IsSuperUser : Boolean;

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
    @ManyToOne(() => Journey)
    public Journey? : Journey;

    @Column()
    @ManyToOne(() => Access)
    public Access? : Access;

    @Column()
    @OneToMany(() => Contact)
    public Contacts : Contact[];

    @Column()
    @ManyToOne(() => Address)
    public Address? : Address;

    constructor(name : string, email : string, job : JobRole)
    {
        this.Id = -1;
        this.Active = true;
        this.Name = name;
        this.Birthdate = new Date();
        this.AdmisionDate = new Date();
        this.DemissionDate = undefined;
        this.Email = email;        
        this.JobRole = job;         
        this.Company = undefined;
        this.Journey = undefined;
        this.Access = undefined;
        this.Contacts = [];
        this.Address = undefined;
        this.IsSuperUser = false;
    }
}





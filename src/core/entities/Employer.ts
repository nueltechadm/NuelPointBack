import {Table, Column, DataType, PrimaryKey, DBTypes, ManyToOne} from 'myorm_pg'; 
import JobRole from './JobRole';


@Table()
export default class Employer
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    public Name : string;

    @Column()
    public Username : string;

    @Column()
    public Password : string;

    @Column()
    public Email : string;   

    @Column()
    @ManyToOne(()=> JobRole, "Employers")
    public JobRole: JobRole;
    
    constructor(name : string, username : string, password : string, email : string, role : JobRole)
    {
        this.Id = -1;
        this.Name = name;
        this.Username = username;
        this.Password = password;
        this.Email = email;
        this.JobRole = role;              

    }
}
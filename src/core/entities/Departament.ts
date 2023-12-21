import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToOne, ManyToMany} from 'myorm_pg'; 
import Company from './Company';
import JobRole from './JobRole';


@Table()
export default class Departament
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    public Description : string;   

    @Column()
    @OneToMany(() => JobRole)
    public JobRoles : JobRole[];
    
    constructor(name : string)
    {
        this.Id = -1;
        this.Description = name;        
        this.JobRoles = [];                
    }
}
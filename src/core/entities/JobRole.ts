import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToOne} from 'myorm_pg'; 
import User from './User';
import Company from './Company';
import Departament from './Departament';


@Table("jobrole_tb")
export default class JobRole
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    public Description : string;

    @Column()
    @OneToMany(()=> User)
    public Users : User[];
    

    @Column()
    @ManyToOne(() => Departament)
    public Departament : Departament;
    
    constructor(description : string, departament: Departament)
    {
        this.Id = -1;
        this.Description = description;        
        this.Users = [];       
        this.Departament = departament;      
    }
}
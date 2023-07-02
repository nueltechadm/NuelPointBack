import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToOne} from 'myorm_pg'; 
import User from './User';
import Company from './Company';
import Departament from './Departament';


@Table()
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
    @ManyToOne(() => Company)
    public Company : Company;

    @Column()
    @ManyToOne(() => Departament)
    public Departament : Departament;
    
    constructor(description : string, company : Company, departament: Departament)
    {
        this.Id = -1;
        this.Description = description;        
        this.Users = [];
        this.Company = company;
        this.Departament = departament;      
    }
}
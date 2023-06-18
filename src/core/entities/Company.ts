import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany} from 'myorm_pg'; 
import User from './User';
import Departament from './Departament';


@Table()
export default class Company
{
    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    public Name : string;

    @Column()
    public Description : string;

    @Column()
    @OneToMany(()=> User)
    public Users : User[];

    @Column()
    @OneToMany(()=> Departament)
    public Departaments : Departament[];
    
    
    constructor(name : string, description : string)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;       
        this.Users = [];
        this.Departaments= [];
        
    }
}
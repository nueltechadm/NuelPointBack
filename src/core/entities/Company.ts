import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToOne} from 'myorm_pg'; 
import User from './User';
import Departament from './Departament';
import Address  from './Address';
import Contact from './Contact';
import Access from './Access';


@Table("company_tb")
export default class Company
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
    public Description : string;

    @Column()
    public Document : string;

    @Column()
    public Logo? : string;

    @Column()
    @OneToMany(()=> User)
    public Users : User[];

    @Column()
    @OneToMany(()=> Departament)
    public Departaments : Departament[];

    @Column()
    @OneToMany(() => Contact)
    public Contacts : Contact[];

    @Column()
    @OneToMany(() => Access)
    public Accesses : Access[];

    @Column()
    @ManyToOne(() => Address)
    public Address? : Address;   
    
    
    constructor(name : string, description : string, document: string)
    {
        this.Id = -1;
        this.Active = true;
        this.Name = name;
        this.Description = description;   
        this.Document = document;    
        this.Logo = undefined; 
        this.Users = [];
        this.Departaments= [];       
        this.Contacts = [];
        this.Accesses = [];
        this.Address = undefined;
    }
}



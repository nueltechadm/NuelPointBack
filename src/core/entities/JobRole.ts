import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany, ManyToOne} from 'myorm_pg'; 
import User from './User';
import Company from './Company';


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
    
    constructor(description : string, company : Company)
    {
        this.Id = -1;
        this.Description = description;        
        this.Users = [];
        this.Company = company;
        
    }
}
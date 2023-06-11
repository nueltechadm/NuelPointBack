import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany} from 'myorm_pg'; 
import User from './User';


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
    public Folder : string;
    
    constructor(name : string, description : string, folder : string)
    {
        this.Id = -1;
        this.Name = name;
        this.Description = description;
        this.Folder = folder;
        this.Users = [];
        
    }
}
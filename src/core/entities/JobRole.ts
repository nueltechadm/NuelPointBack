import {Table, Column, DataType, PrimaryKey, DBTypes, OneToMany} from 'myorm_pg'; 
import Employer from './Employer';


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
    @OneToMany(()=> Employer)
    public Employers : Employer[];

    @Column()
    public Folder : string;
    
    constructor(description : string, folder : string)
    {
        this.Id = -1;
        this.Description = description;
        this.Folder = folder;
        this.Employers = [];
        
    }
}
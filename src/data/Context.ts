import {PGDBContext, PGDBSet, PGDBManager} from 'myorm_pg';

import User from '../core/entities/User';
import Access from '../core/entities/Access';
import Permission from '../core/entities/Permission';
import JobRole from '../core/entities/JobRole';
import Checkpoint from '../core/entities/Checkpoint';
import Company from '../core/entities/Company';
import Time from '../core/entities/Time';
import Journey from '../core/entities/Journey';
import Departament from '../core/entities/Departament';
import Address from '../core/entities/Address';
import Contact from '../core/entities/Contact';

export default class Context extends PGDBContext
{

    
    public Users : PGDBSet<User>; 
    public Access : PGDBSet<Access>; 
    public Permissions : PGDBSet<Permission>; 
    public JobRoles : PGDBSet<JobRole>; 
    public Checkpoints : PGDBSet<Checkpoint>; 
    public Companies : PGDBSet<Company>; 
    public Departaments : PGDBSet<Departament>; 
    public Times : PGDBSet<Time>; 
    public Journeys : PGDBSet<Journey>; 
    public Addresses : PGDBSet<Address>; 
    public Contacts : PGDBSet<Contact>; 


    constructor(manager? : PGDBManager)
    {
        super(manager ?? PGDBManager.BuildFromEnviroment());       
        
        this.Users = new PGDBSet(User, this);
        this.Access = new PGDBSet(Access, this);
        this.Permissions = new PGDBSet(Permission, this);
        this.JobRoles = new PGDBSet(JobRole, this);   
        this.Departaments = new PGDBSet(Departament, this);
        this.Checkpoints = new PGDBSet(Checkpoint, this);   
        this.Companies = new PGDBSet(Company, this);
        this.Times = new PGDBSet(Time, this);
        this.Journeys = new PGDBSet(Journey, this);
        this.Addresses = new PGDBSet(Address, this);
        this.Contacts = new PGDBSet(Contact, this);
        
    }

}
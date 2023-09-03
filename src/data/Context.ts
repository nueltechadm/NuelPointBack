import {PGDBContext, PGDBSet, PGDBManager, PGDBConnection} from 'myorm_pg';

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
import Appointment from '../core/entities/Appointment';
import DatabaseException from '../exceptions/DatabaseException';
import Exception from 'web_api_base/dist/exceptions/Exception';

export default class Context extends PGDBContext
{

    
    public Users : PGDBSet<User>; 
    public Access : PGDBSet<Access>; 
    public Permissions : PGDBSet<Permission>; 
    public JobRoles : PGDBSet<JobRole>; 
    public Checkpoints : PGDBSet<Checkpoint>; 
    public Appointments : PGDBSet<Appointment>; 
    public Companies : PGDBSet<Company>; 
    public Departaments : PGDBSet<Departament>; 
    public Times : PGDBSet<Time>; 
    public Journeys : PGDBSet<Journey>; 
    public Addresses : PGDBSet<Address>; 
    public Contacts : PGDBSet<Contact>; 


    constructor()
    {       
        
        super(PGDBManager.Build("localhost", 5434, "database", "supervisor", "sup"));       
        
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
        this.Appointments = new PGDBSet(Appointment, this);
        this.Contacts = new PGDBSet(Contact, this);
        
    }

    public async SetDatabaseAsync(database : string) : Promise<void>
    {
        this._manager["_connection"]["_database"] = database;
        this._manager["_connection"]["DataBaseName"] = database;

        let worked = await this._manager.CheckConnection();     
            
        if(!worked)
            throw new DatabaseException(`Can not connect to ${database}`);  
    }

}
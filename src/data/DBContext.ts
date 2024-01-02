import {PGDBContext, PGDBSet, PGDBManager, PGDBConnection} from 'myorm_pg';

import User from '@entities/User';
import Access from '@entities/Access';
import JobRole from '@entities/JobRole';
import Checkpoint from '@entities/Checkpoint';
import Company from '@entities/Company';
import Time from '@entities/Time';
import Journey from '@entities/Journey';
import Departament from '@entities/Departament';
import Address from '@entities/Address';
import Contact from '@entities/Contact';
import Appointment from '@entities/Appointment';
import DatabaseException from '../exceptions/DatabaseException';
import DayOfWeek from '@entities/DayOfWeek';
import AbstractDBContext, {IDBChangeable} from './abstract/AbstractDBContext';


export default class DBContext extends PGDBContext implements IDBChangeable
{    
    public Users : PGDBSet<User>; 
    public Access : PGDBSet<Access>; 
    public JobRoles : PGDBSet<JobRole>; 
    public Checkpoints : PGDBSet<Checkpoint>; 
    public Appointments : PGDBSet<Appointment>; 
    public Companies : PGDBSet<Company>; 
    public Departaments : PGDBSet<Departament>; 
    public Times : PGDBSet<Time>; 
    public Journeys : PGDBSet<Journey>; 
    public DaysOfWeek : PGDBSet<DayOfWeek>; 
    public Addresses : PGDBSet<Address>; 
    public Contacts : PGDBSet<Contact>; 


    constructor()
    {       
        
        super(PGDBManager.BuildFromEnviroment());       
        
        this.Users = new PGDBSet(User, this);
        this.Access = new PGDBSet(Access, this);
        this.JobRoles = new PGDBSet(JobRole, this);   
        this.Departaments = new PGDBSet(Departament, this);
        this.Checkpoints = new PGDBSet(Checkpoint, this);   
        this.Companies = new PGDBSet(Company, this);
        this.Times = new PGDBSet(Time, this);
        this.Journeys = new PGDBSet(Journey, this);
        this.DaysOfWeek = new PGDBSet(DayOfWeek, this);
        this.Addresses = new PGDBSet(Address, this);
        this.Appointments = new PGDBSet(Appointment, this);
        this.Contacts = new PGDBSet(Contact, this);
        
    }

    public async SetDatabaseAsync(database : string) : Promise<void>
    {
        this._manager["_connection"]["_database"] = database;
        this._manager["_connection"]["DataBaseName"] = database;

        let worked = await this._manager.CheckConnectionAsync();     
            
        if(!worked)
            throw new DatabaseException(`Can not connect to ${database}`);  
    }

}


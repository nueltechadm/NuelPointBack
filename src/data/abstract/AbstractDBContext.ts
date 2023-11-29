import {AbstractContext, AbstractSet} from 'myorm_pg';
import Access from '../../core/entities/Access';
import Address from '../../core/entities/Address';
import Appointment from '../../core/entities/Appointment';
import Checkpoint from '../../core/entities/Checkpoint';
import Company from '../../core/entities/Company';
import Contact from '../../core/entities/Contact';
import DayOfWeek from '../../core/entities/DayOfWeek';
import Departament from '../../core/entities/Departament';
import JobRole from '../../core/entities/JobRole';
import Journey from '../../core/entities/Journey';
import Permission from '../../core/entities/Permission';
import Time from '../../core/entities/Time';
import User from '../../core/entities/User';

export interface IDBContext 
{
    Users : AbstractSet<User>; 
    Access : AbstractSet<Access>; 
    Permissions : AbstractSet<Permission>; 
    JobRoles : AbstractSet<JobRole>; 
    Checkpoints : AbstractSet<Checkpoint>; 
    Appointments : AbstractSet<Appointment>; 
    Companies : AbstractSet<Company>; 
    Departaments : AbstractSet<Departament>; 
    Times : AbstractSet<Time>; 
    Journeys : AbstractSet<Journey>; 
    DaysOfWeek : AbstractSet<DayOfWeek>; 
    Addresses : AbstractSet<Address>; 
    Contacts : AbstractSet<Contact>; 
    SetDatabaseAsync(database : string) : Promise<void>;
}


export default abstract class AbstractDBContext extends AbstractContext implements IDBContext
{
    abstract Users: AbstractSet<User>;
    abstract Access: AbstractSet<Access>;
    abstract Permissions: AbstractSet<Permission>;
    abstract JobRoles: AbstractSet<JobRole>;
    abstract Checkpoints: AbstractSet<Checkpoint>;
    abstract Appointments: AbstractSet<Appointment>;
    abstract Companies: AbstractSet<Company>;
    abstract Departaments: AbstractSet<Departament>;
    abstract Times: AbstractSet<Time>;
    abstract Journeys: AbstractSet<Journey>;
    abstract DaysOfWeek: AbstractSet<DayOfWeek>;
    abstract Addresses: AbstractSet<Address>;
    abstract Contacts: AbstractSet<Contact>;    
    abstract SetDatabaseAsync(database : string) : Promise<void>;
}




import {PGDBContext, PGDBSet, PGDBManager} from 'myorm_pg';

import User from '../core/entities/User';
import Permission from '../core/entities/Permission';
import JobRole from '../core/entities/JobRole';
import Checkpoint from '../core/entities/Checkpoint';

export default class Context extends PGDBContext
{

    
    public Users : PGDBSet<User>; 
    public Permissions : PGDBSet<Permission>; 
    public JobRoles : PGDBSet<JobRole>; 
    public Checkpoints : PGDBSet<Checkpoint>; 


    constructor(manager? : PGDBManager)
    {
        super(manager ?? PGDBManager.BuildFromEnviroment());
        
        
        this.Users = new PGDBSet(User, this);
        this.Permissions = new PGDBSet(Permission, this);
        this.JobRoles = new PGDBSet(JobRole, this);   
        this.Checkpoints = new PGDBSet(Checkpoint, this);   
        
    }

}
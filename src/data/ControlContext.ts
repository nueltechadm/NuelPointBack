import { PGDBContext, PGDBSet, PGDBManager } from 'myorm_pg';

import Database from '../core/entities/Database';

export class ControlContext extends PGDBContext {

    public Databases: PGDBSet<Database>;

    constructor() {

        super(PGDBManager.Build("localhost", 5434, "control_db", "supervisor", "sup"));

        this.Databases = new PGDBSet(Database, this);
    }
}

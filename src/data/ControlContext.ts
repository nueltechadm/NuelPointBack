import { PGDBSet, PGDBManager, PGDBContext } from 'myorm_pg';
import Database from '@entities/Database';

export default class ControlContext extends PGDBContext {

    public Databases: PGDBSet<Database>;

    constructor() {

        super(PGDBManager.BuildFromEnviroment());

        this.Databases = new PGDBSet(Database, this);
    }
}

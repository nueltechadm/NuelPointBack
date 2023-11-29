import { AbstractContext, AbstractSet } from 'myorm_pg';
import Database from '../../core/entities/Database';

export interface IControlContext 
{
    Databases: AbstractSet<Database>;
}


export default abstract class AbstractControlContext extends AbstractContext  implements IControlContext{
    abstract Databases: AbstractSet<Database>;
}

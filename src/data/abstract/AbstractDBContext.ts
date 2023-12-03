import { AbstractContext} from 'myorm_core';


export default abstract class AbstractDBContext extends AbstractContext implements IDBChangeable
{    
    abstract SetDatabaseAsync(database : string) : Promise<void>;  
}

export interface IDBChangeable 
{
    SetDatabaseAsync(database : string) : Promise<void>;    
}




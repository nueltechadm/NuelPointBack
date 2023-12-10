

export default abstract class AbstractService<T>
{
    abstract SetClientDatabaseAsync(client : string) : Promise<void>;
    abstract ExistsAsync(id : number) : Promise<boolean>;
    abstract AddAsync(obj : T) : Promise<T>;
    abstract UpdateAsync(obj : T) : Promise<T>;
    abstract UpdateObjectAndRelationsAsync<U extends keyof T>(obj : T, relations : U[]) : Promise<T>;
    abstract DeleteAsync(obj : T) : Promise<T>;
    abstract GetAllAsync() : Promise<T[]>;
    abstract GetByIdAsync(id : number) : Promise<T | undefined>;
    abstract GetByAndLoadAsync<K extends keyof T>(key : K, value : T[K], load : (keyof T)[]) : Promise<T[]>;
    abstract CountAsync() : Promise<number>;
    abstract IsCompatible(obj : any) : obj is T;
    abstract ValidateObject(obj : T) : void;
}


export class PaginatedFilterResult<T>
{
   Result : T[] = []; 
   Quantity : number = 10;
   Total : number = 0;
   Page : number = 1;
}

export class PaginatedFilterRequest
{
   Quantity : number = 10;   
   Page : number = 1;
}
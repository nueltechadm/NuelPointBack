

export default abstract class AbstractService<T>
{
    abstract SetClientDatabaseAsync(client : string) : Promise<void>;
    abstract AddAsync(obj : T) : Promise<T>;
    abstract UpdateAsync(obj : T) : Promise<T>;
    abstract DeleteAsync(obj : T) : Promise<T>;
    abstract GetAllAsync() : Promise<T[]>;
    abstract CountAsync() : Promise<number>;
    abstract IsCompatible(obj : any) : obj is T;
    abstract ValidateObject(obj : T) : void;
}
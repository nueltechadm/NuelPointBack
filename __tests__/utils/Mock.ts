export default class Mock
{
    public static Copy<T extends object>(source : T) : T & IChangeble<T>
    {
        return (new Changeable<T>(source) as any) as T & IChangeble<T>;     
    }  
    
    public static CreateInstance<T extends object>(cTor : new (...args : any[]) => T) : T & IChangeble<T>
    {       
        return (new Changeable<T>(Reflect.construct(cTor, []) as T) as any) as T & IChangeble<T>;     
    }     

    public static CreateIntanceFromAbstraction<T extends object>() : T & IChangeble<T>
    {
       return (new Changeable<T>(undefined) as any) as T & IChangeble<T>;        
    }
}

export interface IChangeble<T extends object>
{
    ChangeBehavior<U extends keyof T>(member : U, callback : T[U]): T & IChangeble<T>;
    HasCalled<U extends keyof T>(member : U): number;
}

export class Changeable<T extends object> implements IChangeble<T>
{
    private _source : T;
    private _counter : {[key : string] : number} = {};

    constructor(source : T | undefined)
    {
        this._source = source ?? {} as T;

        if(source)
            (this as any).__proto__ = this._source.constructor;

        Object.keys(this._source).forEach(c => 
        {
            if(typeof (this._source as any)[c] == "function")
            {
                (this as any)[c] = (...args: any[]) : any =>
                {
                    if(Object.keys(this._counter).Any(s => s == c))
                        this._counter[c]++;
                    else
                        this._counter[c] = 1;
                }
            }
            else
                (this as any)[c] = (this._source as any)[c];
        });

    }

    public ChangeBehavior<U extends keyof T>(member: U, callback: T[U]): T & IChangeble<T> {
        
        this._source[member] = callback;
        (this as any)[member] = callback;
        return this as any as T & IChangeble<T>;
    }

    public HasCalled<U extends keyof T>(member: U): number {
        
        if(Object.keys(this._counter).Any(s => s == member))
            return this._counter[member.toString()];
        else 
            return 0;
    }

}
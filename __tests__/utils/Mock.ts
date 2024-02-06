import 'ts_linq_base';
export default class Mock
{    
    
    public static CreateInstance<T extends object>(cTor : new (...args : any[]) => T, args : any[]) : T & IChangeble<T>
    {
        return (Builder.MakeChangeable(cTor, args) as any) as T & IChangeble<T>;     
    }     

    public static CreateIntanceFromAbstraction<T extends object>() : T & IChangeble<T>
    {
        return (Builder.MakeChangeable(Object, []) as any) as T & IChangeble<T>;       
    }

    public static Cast<T extends object>(o : T) :  T & IChangeble<T>
    {
        return o as T & IChangeble<T>;
    }
    
}

const counterSymbol = Symbol("_counter");
export class Builder
{   
    public _counter : {[key : string] : number} = {};
    
    public static MakeChangeable<T extends object>(cTor : new (...args : any[]) => T, args: any[])
    {
        let instance = Reflect.construct(cTor, args);

        let instanceAsAny = instance as any;

        instanceAsAny[counterSymbol] = {};

        let members = Reflect.ownKeys(cTor.prototype);       

        if(cTor.name != Object.name)
            members.forEach(c => 
            {
                if(typeof instanceAsAny[c] == "function" && c.toString() != "constructor")
                {
                    let o = instanceAsAny[c];

                    instanceAsAny[c] = (...args: any[]) : any =>
                    {
                        if(Object.keys(instanceAsAny[counterSymbol] ?? {}).Any(s => s == c))
                            instanceAsAny[counterSymbol][c.toString()]++;
                        else
                            instanceAsAny[counterSymbol][c.toString()] = 1;

                        return Reflect.apply(o, instanceAsAny, args);
                    }
                }            
            });

        cTor.prototype.DefineBehavior = function<U extends keyof T>(member: U, callback: (...args: any[]) => any): T & IChangeble<T> 
        {
            return Builder.DefineBehavior(this, member, callback);
        }

        cTor.prototype.ChangeBehavior = function<U extends keyof T>(member: U, callback: (...args: any[]) => any): T & IChangeble<T> 
        {
            return Builder.ChangeBehavior(this, member, callback);
        }

        cTor.prototype.HasCalled = function<U extends keyof T>(member: U): number 
        {
            return Builder.HasCalled(this, member);
        }

        return instance;

    }


    public static DefineBehavior<T extends object, U extends keyof T>(source : T, member: U, callback: (...args: any[]) => any): T & IChangeble<T> { 

       return Builder.ChangeBehavior(source ,member, callback as T[U]);
    }
    
    public static ChangeBehavior<T extends object, U extends keyof T>(source : T,member: U, callback: T[U]): T & IChangeble<T> { 
       
        (source as any)[member] = callback;

        let sourceAsAny = source as any;

        let o = sourceAsAny[member];

        sourceAsAny[member] = (...args: any[]) => 
        {
            if(Object.keys(sourceAsAny[counterSymbol] ?? {}).Any(s => s == member.toString()))
                sourceAsAny[counterSymbol][member.toString()]++;
            else
                sourceAsAny[counterSymbol][member.toString()] = 1;
            
            return Reflect.apply(o, sourceAsAny, args);
        };
        
        return source as any as T & IChangeble<T>;
    }

    public static HasCalled<T extends object, U extends keyof T>(source : T, member: U): number {
        
        let sourceAsAny = source as any;
        
        if(Object.keys(sourceAsAny[counterSymbol] ?? {}).Any(s => s == member))
            return sourceAsAny[counterSymbol][member.toString()];
        else 
            return 0;
    }

}

export interface IChangeble<T>
{    
    DefineBehavior<U extends keyof T>(member : U, callback : (...args: any[]) => any): T & IChangeble<T>;
    ChangeBehavior<U extends keyof T>(member : U, callback : T[U]): T & IChangeble<T>;
    HasCalled<U extends keyof T>(member : U): number;
}


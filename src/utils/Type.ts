import Schema from '../../node_modules/myorm_pg/lib/core/decorators/SchemasDecorators';
import TP  from '../../node_modules/myorm_pg/lib/core/design/Type';


export default class Type
{
    public static HasKeys<T>(obj : any, ...keys: (keyof T & string)[]) : obj is T
    {
        if(!obj)
            return false;

        for(let k of keys)
        {
            if(!(k in obj))
                return false;
        }

        return true;
    }

    public static Delete<T extends object>(obj : T, key : keyof T) : T
    {
        if(!obj)
            return obj;

        delete obj[key];

        return obj;
    }

    public static IsObject(obj : any) : obj is object
    {
        return obj != undefined && typeof obj == "object";
    }

    public static RemoveFieldsRecursive<T extends object>(obj? : T, fields? : string[] ) : T | undefined
    {
        if(obj == undefined || obj == null)
            return obj;

        let removeRecursive = (k : any, o : any) => 
        {
            if(!k)
                return;

            if(typeof k === "function")
                return;

            if(k.constructor == Array)
                return

            if(["String", "Number", "Date"].indexOf(k.constructor.name) > -1)
                return;

            for(let c in k)
            {
                if(k[c] == undefined)
                    continue;

                if(fields?.Any(s => s === c))
                { 
                    if(fields?.Any())
                        fields.forEach(f => delete k[f]);

                    continue;
                }

                if(k[c] == o)
                    continue;

                if(["String", "Number"].indexOf(k[c].constructor.name) > -1)
                    continue;

                if(k[c].constructor.name == "Array")
                {
                    for(let i of k[c])
                        removeRecursive(i, k);
                }

                removeRecursive(k[c], k);
            }           
        };

        removeRecursive(obj, obj);

        return obj;
    }

    public static CreateInstance<T extends object>(ctor : new (...args: any[]) => T) : T
    {
        let base = Reflect.construct(ctor, []) as T;      

        return Type.FillObject(base);
    }

    public static CreateTemplateWithPrimitivesFields<T extends object>(ctor : new (...args: any[]) => T) : T
    {
        let o = Type.CreateTemplateFrom(ctor);

        for(let c in o)
        {
            if((o as any)[c] && (o as any)[c].constructor == Array)
            {
                o = Type.Delete(o, c as keyof(typeof o));
            }
        }

        return o;
    }

    public static CreateTemplateFrom<T extends object>(ctor : new (...args: any[]) => T, recursive = false) : T
    {
        let base = Reflect.construct(ctor, []) as T;

        if(recursive)
            for(let map of TP.GetColumnNameAndType(ctor))
            {
                let relation = Schema.GetRelationAttribute(ctor, map.Field);
                let designType = TP.GetDesingType(ctor, map.Field);

                if(relation && designType)
                {
                    if(designType != Array)                
                        (base as any)[map.Field] = Type.FillObject(Reflect.construct(relation.TypeBuilder(), []) as object);
                    else
                        (base as any)[map.Field] = [Type.FillObject(Reflect.construct(relation.TypeBuilder(), []) as object)];
                }
            }       

        return Type.FillObject(base);
    }

    public static RemoveAllRelationedObject<T extends object>(obj : T) : T
    {
        for(let c in obj)
        {
            let d = TP.GetDesingType((obj as any).constructor, c);

            if(!d)
                continue;

            if(!["Number", "String", "Boolean", "Date"].Any(s => s == d?.name))
                Reflect.set(obj, c, undefined);
               
        }

        return obj;
    }

    public static FillObject<T extends object>(obj : T) : T
    {
        
        for(let c in obj)
        {
            let d = TP.GetDesingType(obj.constructor, c);

            if(!d)
                continue;

            if(d.name === "Number")
                (obj as any)[c] = -1;
            else  if(d.name === "String")
                (obj as any)[c] = c;
            else  if(d.name === "Boolean")
                (obj as any)[c] = false;
            else  if(d.name === "Date")
                (obj as any)[c] = new Date();
            else  if(d.name === "Array")
                (obj as any)[c] = [];
        }

        return obj;
    }


    public static RemoveCircularReferences<T extends object, K extends keyof T>(origin: T, removeThis? : T[K]) : T
    {        
        let source = origin as any;

        if(source == undefined || source.constructor == Array)
            return source;  

        for(let c in source)
        {
            if(c == "_orm_metadata_")
                continue;

            if(!source[c])
                continue;

            if(["string", "boolean", "number", "function"].includes(typeof source[c]))
                continue;

            if(source[c] instanceof Date)
                continue;
                
            let isArray = source[c].constructor == Array;

            if(isArray && source[c].Any())
            {
                for(let i of source[c]){                    
                    Type.RemoveCircularReferences(i, source);                    
                }

                continue;
            }

            if(isArray)
                continue;

            if(source[c] == removeThis ?? source)
                source[c] = undefined;
            else{ 
                Type.RemoveCircularReferences(source[c], undefined);                
            }
            
        }

        return source as T;
    }  
       
}
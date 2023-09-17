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

    public static IsObject(obj : any) : obj is object
    {
        return obj != undefined && typeof obj == "object";
    }

    public static RemoveORMMetadata<T extends object>(obj? : T ) : T | undefined
    {
        if(obj == undefined || obj == null)
            return obj;

        let removeRecursive = (k : any) => 
        {
            if(!k)
                return;

            if(["String", "Number"].indexOf(k.constructor.name) > -1)
                return;

            for(let c in k)
            {
                if(k[c] == undefined)
                    continue;

                if(c == '_orm_metadata_')
                {
                    delete k._orm_metadata_;
                    continue;
                }

                if(["String", "Number"].indexOf(k[c].constructor.name) > -1)
                    continue;

                if(k[c].constructor.name == "Array")
                {
                    for(let i of k[c])
                        removeRecursive(i);
                }

                removeRecursive(k[c]);
            }           
        };

        removeRecursive(obj);

        return obj;
    }

    public static CreateTemplateFrom<T extends object>(ctor : new (...args: any[]) => T) : T
    {
        let base = Reflect.construct(ctor, []) as T;

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
        }

        return obj;
    }


    public static RemoveCircularReferences<T extends object, K extends keyof T>(removeThis: T, fromThis? : T[K]) : T
    {
        let source : any = fromThis ?? removeThis;        

        for(let c in source)
        {
            if(!source[c])
                continue;

            if(["string", "boolean", "number"].includes(typeof source[c]))
                continue;

            let isArray = source[c].constructor == Array;

            if(isArray && source[c].lenght > 0)
            {
                if(source[c].filter((s : any) => s == removeThis))
                    source[c] = source[c].filter((s : any) => s != removeThis);  
                
                for(let i of source[c]){

                    Type.RemoveCircularReferences(removeThis, i);
                    Type.RemoveCircularReferences(i);
                }

                continue;
            }

            if(source[c] == removeThis)
                source[c] = undefined;
            else{

                Type.RemoveCircularReferences(removeThis, source[c]);
                Type.RemoveCircularReferences(source[c]);
            }
            
        }

        return source as T;
    }      

       
}
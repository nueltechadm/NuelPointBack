
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

    public static RemoveORMMetadata<T extends object>(obj : T ) : T 
    {
        if(obj == undefined || obj == null)
            return obj;

        let removeRecursive = (k : any) => 
        {
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
}
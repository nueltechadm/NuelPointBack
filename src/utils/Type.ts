
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
}
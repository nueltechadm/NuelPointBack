import { ControllerBase, ProducesResponse, RequestJson } from "web_api_base";
import Type from "../utils/Type";

export default abstract class AbstractController extends ControllerBase {
    abstract SetClientDatabaseAsync(): Promise<void>; 
    
    public override OK<T>(result?: T | undefined): T | undefined 
    {
        if(result)
        {            
            if((result as any).constructor == Array)
            {
                for(let i of result as any)
                {
                    if(Type.IsObject(i))
                    {
                        Type.RemoveCircularReferences(i);   
                        Type.RemoveORMMetadata(i);
                    }
                }
            }else if(Type.IsObject(result))
            {
                Type.RemoveCircularReferences(result);   
                Type.RemoveORMMetadata(result);                
            }
        }
        
        return super.OK(result);
    }   

    protected static ReceiveType<T extends object>(resultType : new (...args : any[]) => T, isArray : boolean = false)
    {
        if(isArray)
            return RequestJson(JSON.stringify([Type.CreateTemplateFrom<T>(resultType)], null, 2));

        return RequestJson(JSON.stringify(Type.CreateTemplateFrom<T>(resultType), null, 2));

    }

    protected static ProducesType<T extends object>(status: number, description : string, resultType : new (...args : any[]) => T, isArray : boolean = false)
    {
        if(!resultType)
        {
            return ProducesResponse({Status : status, JSON : ""});
        }

        if(isArray) 
            return ProducesResponse({Status : status, Description: description, JSON : JSON.stringify([Type.CreateTemplateFrom<T>(resultType)], null, 2)});

        return ProducesResponse({Status : status, Description: description, JSON : JSON.stringify(Type.CreateTemplateFrom<T>(resultType), null, 2)});

    }

    protected static ProducesMessage(status: number, description : string, result : any)
    {     
        if(!result || typeof result != "object")
            return ProducesResponse({Status : status, Description: description, JSON : result ?? "" });

        return ProducesResponse({Status : status, Description: description, JSON : JSON.stringify(result, null, 2)});

    }
    
}

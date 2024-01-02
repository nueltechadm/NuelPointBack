import { ControllerBase, OKResult, ProducesResponse, RequestJson } from "web_api_base";
import Type from "@utils/Type";
import AbstractService from "@contracts/AbstractService";
import Authorization from "@utils/Authorization";

export default abstract class AbstractController extends ControllerBase {    
    
    public override OK<T>(result?: T): OKResult<T> 
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
                        Type.RemoveFieldsRecursive(i, ["_orm_metadata_", "Password"]);
                    }
                }
            }else if(Type.IsObject(result))
            {
                Type.RemoveCircularReferences(result);   
                Type.RemoveFieldsRecursive(result, ["_orm_metadata_", "Password"]);                
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

    public async SetClientDatabaseAsync(): Promise<void>
    {
        for(let key of Object.keys(this))
        {
            let service = Reflect.get(this, key);

            if(service && service instanceof AbstractService)
                await service.SetClientDatabaseAsync(Authorization.CastRequest(this.Request).GetClientDatabase());
        }
    } 
    
}

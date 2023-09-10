import { ControllerBase } from "web_api_base";
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

    
}

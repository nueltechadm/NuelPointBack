import {Application, ControllerBase, IHTTPRequestContext} from 'web_api_base';
import {Decode, DecodeResult} from '@utils/JWT';
import Authorization from '@utils/Authorization';

export function IsLogged(context : IHTTPRequestContext) : void
{   

    if(Application.Configurations.DEBUG && context.Request.url.indexOf("/login/") != 0){
        context.Request.APIAUTH = new Authorization("development", "development", 1);      
        console.debug(`No auth in DEBUG mode: ${context.Request.url}`);
        return context.Next();
    }
    
    let token = context.Request.headers["token"];   

    let decodeResult = Decode(token);    

    if(decodeResult.Result == DecodeResult.INVALID || decodeResult.Token == undefined)
    {
        context.Response.status(401);
        context.Response.json({Message : "Invalid token"});
        return;
    }

    if(decodeResult.Result == DecodeResult.EXPIRED)
    {
        context.Response.status(401);
        context.Response.json({Message : "Token has expired"});
        return;
    }

    try{

        let auth = Authorization.Parse(decodeResult.Token.Payload); 
        context.Request.APIAUTH = auth;

    }catch(ex)
    {
        context.Response.status(401);
        context.Response.json({Message : (ex as Error).message});
        return;
    }


    context.Next();
}



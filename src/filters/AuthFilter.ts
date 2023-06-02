import {IHTTPRequestContext} from 'web_api_base';
import {Decode, DecodeResult} from '../utils/JWT';

export function IsLogged(context : IHTTPRequestContext) : void
{   

    if(process.env.ENVIROMENT = 'DEBUG'){       
        console.debug(`No auth in DEBUG mode: ${context.Request.url}`);
        return context.Next();
    }
    
    let token = context.Request.headers["token"];   

    let decodeResult = Decode(token); 

    if(decodeResult.Result == DecodeResult.INVALID)
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

    context.Next();
}


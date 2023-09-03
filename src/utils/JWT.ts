import JWT from 'jsonwebtoken';
import Authorization from './Authorization';

const private_key = "adrianoonairda";


export function Generate(authorization : Authorization, duration : number) : string
{
    if(duration <= 0 || duration >= 24)
        duration = 24;

    let d = new Date();
    d.setHours(d.getHours() + 1);   
    return JWT.sign({ Payload : authorization, ExpiresIn : d}, private_key);
}



export function Decode(token : string) : { Token : any, Result : DecodeResult }
{
    let decoded : any;

    try{

        decoded = JWT.verify(token, private_key);       

        let expiresIn = new Date(decoded.ExpiresIn)

        if(expiresIn > new Date())
        {
            return { Token : decoded, Result : DecodeResult.VALID};
        }

        return { Token : decoded, Result : DecodeResult.EXPIRED};

    }catch{}

    return { Token : undefined, Result : DecodeResult.INVALID};
}


export enum DecodeResult
{
    INVALID, 
    EXPIRED, 
    VALID
}



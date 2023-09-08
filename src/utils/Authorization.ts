import TokenDecodeException from '../exceptions/TokenDecodeException';
import { Generate } from './JWT';

export default class Authorization {

    public User: string;
    public Link: string;

    constructor(user: string, link: string) {
        this.User = user;
        this.Link = link    
    }

    public GetClientDatabase() : string
    {
        return this.Link.trim().toLocaleLowerCase();
    }

    public static GenerateToken(auth: Authorization, duration: number): string {
        return Generate(auth, duration);
    }

    public static Parse(payload: any): Authorization {
        if (!payload)
            throw new TokenDecodeException("Invalid or not provided Token");

        return Authorization.Cast(payload);
    }

    public static CastRequest(payload : any) : Authorization
    {
        return Authorization.Cast(payload.APIAUTH);
    }

    public static Cast(payload : any) : Authorization
    {
        try {

            let auth = new Authorization
            (payload.User.toString(),
             payload.Link.toString()); 
             return auth;
 
         } catch {
             throw new TokenDecodeException("Can not parse the token in a valid authorization");
         }
    }

    

}

import TokenDecodeException from '../exceptions/TokenDecodeException';
import { Generate } from './JWT';

export default class Authorization {

    public User: string;
    public Company: string;
    public CompanyId: string;


    constructor(user: string, company: string, companyId: string) {
        this.User = user;
        this.Company = company;
        this.CompanyId = companyId;
    }

    public GetClientDatabase() : string
    {
        return `emp_${this.CompanyId}`;
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
             payload.Company.toString(),
             payload.CompanyId.toString());
 
             return auth;
 
         } catch {
             throw new TokenDecodeException("Can not parse the token in a valid authorization");
         }
    }

    

}

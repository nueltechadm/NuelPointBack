
import AbstractEmployerService from "../core/abstractions/AbstractEmployerService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import {MD5} from '../utils/Cryptography';
import ObjectNotFoundExcpetion from "../exceptions/ObjectNotFoundExcpetion";
import Employer from "../core/entities/Employer";

export default class EmployerService  extends AbstractEmployerService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override async GetByIdAsync(id: number): Promise<Employer| undefined> {
        
        return await this._context.Employers.Where(
                                        {
                                            Field : "Id", 
                                            Value : id
                                        })
                                        .Join("JobRole")
                                        .FirstOrDefaultAsync();
        
    }
    public override async GetByNameAsync(name: string): Promise<Employer[]> {

        return await this._context.Employers.WhereField("Name").Constains(name).Join("JobRole").ToListAsync() ?? [];
    }

    public override async GetByUserNameAndPasswordAsync(username: string, password : string): Promise<Employer | undefined> {

       return await this._context.Employers
                                .WhereField("Username").IsEqualTo(username)
                                .AndField("Password").IsEqualTo(MD5(password))
                                .AndLoadAll("JobRole")
                                .FirstOrDefaultAsync();           
     
    }

    public override async GetByEmailAsync(email: string): Promise<Employer | undefined> {

        return await this._context.Employers.Where(
                                            {
                                                Field : "Email", 
                                                Value : email
                                            })
                                            .Join("JobRole")
                                            .FirstOrDefaultAsync();
    }

    public override async AddAsync(obj: Employer): Promise<Employer> 
    { 
        obj.Password = MD5(obj.Password);
        let role = await this._context.JobRoles.WhereField("Id").IsEqualTo(obj.JobRole.Id).FirstOrDefaultAsync();

        if(!role)
            throw new ObjectNotFoundExcpetion(`Can not found the job role of this employer`);
        
        obj.JobRole = role;

        return await this._context.Employers.AddAsync(obj)!;        
    }

    public override async UpdateAsync(obj: Employer): Promise<Employer> {

        let curr = await this.GetByIdAsync(obj.Id);

        if(!curr)
            throw new ObjectNotFoundExcpetion(`This employer do not exists on database`);

        if(curr.Password != obj.Password)
            obj.Password = MD5(obj.Password);   
        
        let role = await this._context.JobRoles.WhereField("Id").IsEqualTo(obj.JobRole.Id).FirstOrDefaultAsync();

        if(!role)
            throw new ObjectNotFoundExcpetion(`Can not found the job role of this employer`);
            
        obj.JobRole = role;

        return await this._context.Employers.UpdateAsync(obj)!;
    }

    public override async DeleteAsync(obj: Employer): Promise<Employer> {

       return await this._context.Employers.DeleteAsync(obj)!;
    }

    public override async GetAllAsync(): Promise<Employer[]> {

        return await this._context.Employers.Join("JobRole").OrderBy("Name").ToListAsync()!;
    } 
   

}

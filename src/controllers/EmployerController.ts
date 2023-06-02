
import { ControllerBase, POST, PUT, DELETE, GET, Inject, FromBody, FromQuery, Use, Validate } from "web_api_base";
import AbstractEmployerService from "../core/abstractions/AbstractEmployerService";
import Employer from "../core/entities/Employer";
import {IsLogged} from '../filters/AuthFilter';

@Use(IsLogged)
@Validate()
export default class EmployerController extends ControllerBase
{   
    @Inject()
    private _service : AbstractEmployerService;

    constructor(service : AbstractEmployerService)
    {
        super();                    
        this._service = service;
    }    
    

    @GET("list")
    public async GetAllAsync() : Promise<void>
    {       
       let employers =  await this._service.GetAllAsync();

       employers.forEach(s => this.RemovePassWordAndMetadata(s));

       this.OK(employers);
    }    
    
    @GET("getById")    
    public async GetByIdAsync(@FromQuery()id : number) : Promise<void>
    { 
       this.OK(this.RemovePassWordAndMetadata(await this._service.GetByIdAsync(id)));
    }          
    
    @POST("insert")
    public async InsertAsync(@FromBody()employer : Employer) : Promise<void>
    {  
        this.OK(await this._service.AddAsync(employer));
    }
    
    @PUT("update")   
    public async UpdateAsync(@FromBody()employer : Employer) : Promise<void>
    {        
        if(employer.Id == undefined || employer.Id <= 0)
            return this.BadRequest({ Message : "The ID must be greater than 0"});
        
        let update = await this._service.GetByIdAsync(employer.Id);

        if(!update)
            return this.NotFound({Message : "Employer not found"});

        this.OK(await this._service.UpdateAsync(employer));
    }

    @DELETE("delete")    
    public async DeleteAsync(@FromQuery()id : number) : Promise<void>
    {  
        if(!id)
            return this.BadRequest({ Message : "The ID must be greater than 0"});

        let del = await this._service.GetByIdAsync(id);

        if(!del)
            return this.NotFound({Message : "Employer not found"});

        this.OK(await this._service.DeleteAsync(del));
    }

    private RemovePassWordAndMetadata(employer? : Employer) : Employer | undefined
    {
        if(!employer)
            return undefined;

        delete (employer as any).Password;
        delete (employer as any)._orm_metadata_;

        if(employer.JobRole)
        {
            try{

                delete (employer.JobRole as any).Employers;
                delete (employer.JobRole as any)._orm_metadata_;

            }catch{}
        }
        return employer;
    }
}
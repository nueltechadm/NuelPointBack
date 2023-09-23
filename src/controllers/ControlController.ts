import { Inject, GET, ControllerBase, FromQuery, UseBefore } from "web_api_base";
import { DababaseStatus } from "../core/entities/Database";
import AbstractDatabaseService from "../services/abstractions/AbstractDatabaseService";
import   DatabasesAuthFilter from "../filters/DatabasesAuthFilter";

@UseBefore(DatabasesAuthFilter)
export default class ControlController extends ControllerBase {
    @Inject()
    private _service: AbstractDatabaseService;

    constructor(service: AbstractDatabaseService) {
        super();
        this._service = service;
    }

    @GET("init")
    public async CreateDatabaseAsync(@FromQuery() name: string) {

        if(!name)
            return this.BadRequest({Message : "The parameter \"name\" is required"});

        let exist = await this._service.CheckIfDatabaseExists(name);

        if(exist)
            this.OK({ Message: "Database already exists" });

        (async () => {

            try
            {

                await this._service.CreateDabaseAsync(name);

            }
            catch(err)
            {
                let db = await this._service.GetDabaseAsync(name)!;

                if(db)
                {
                    db.Observation = (err as any).message;
                    db.Status = DababaseStatus.CREATEFAIL;
                    await this._service.UpdateDatabaseAsync(db);
                }                
            }
                
        })();

        this.OK({ Message: "Command sent to queue" });
    }

    @GET("check")
    public async CheckDatabaseAsync(@FromQuery() name: string) {

        if(!name)
            return this.BadRequest({Message : "The parameter \"name\" is required"});

        let db = await this._service.GetDabaseAsync(name);

        if (db)
            this.OK(db);       
        else 
            this.NotFound();       
            
    }


    @GET("update")
    public async UpdateDatabaseAsync(@FromQuery() name: string) {

        if(!name)
            return this.BadRequest({Message : "The parameter \"name\" is required"});

        let db = await this._service.GetDabaseAsync(name);

        if (!db)           
            return this.NotFound();  
        
        if(db.Status == DababaseStatus.UPDATING)
            return this.OK({Message : `The database ${name} is already updating`});
    
        if(db.Status == DababaseStatus.CREATED || db.Status == DababaseStatus.UPDATED)
        {            
            (async()=>
            {
                await this._service.UpdateDatabaseSchemaAsync(db);

            })();

            return this.OK({Message : `The database ${name} is updating`});
        }
        else
        {
            return this.BadRequest({Message : `Can not update a database with status : ${db.Status.toString()}`});
        } 
            
    }

}

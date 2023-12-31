import { Inject, GET, ControllerBase, FromQuery, UseBefore, ActionResult, Validate } from "web_api_base";
import { DababaseStatus } from "@entities/Database";
import AbstractDatabaseService from "@non-core-contracts/AbstractDatabaseService";
import   DatabasesAuthFilter from "@filters/DatabasesAuthFilter";

@UseBefore(DatabasesAuthFilter)
@Validate()
export default class ControlController extends ControllerBase {
    @Inject()
    private _service: AbstractDatabaseService;


    constructor(service: AbstractDatabaseService) {
        super();
        this._service = service;
    }

    

    @GET("init")
    public async CreateDatabaseAsync(@FromQuery() name: string) : Promise<ActionResult>
    {
        let exist = await this._service.CheckIfDatabaseExists(name);

        if(exist)
            return this.OK({ Message: "Database already exists" });

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

        return this.OK({ Message: "Command sent to queue" });
    }




    @GET("check")
    public async CheckDatabaseAsync(@FromQuery() name: string) : Promise<ActionResult>
    {

        let db = await this._service.GetDabaseAsync(name);

        if (db){

            (db as any)["StatusString"] = db.Status.toString();
            return this.OK(db);  
        }     
        else 
            return this.NotFound();       
            
    }

    @GET("force-update")
    public async ForceUpdateDatabaseAsync(@FromQuery() name: string) : Promise<ActionResult>
    {
        let db = await this._service.GetDabaseAsync(name);

        if (!db)           
            return this.NotFound();         
      
        if(db.Status == DababaseStatus.CREATING)
            return this.BadRequest({Message : `Can not update a database with status : ${db.Status.toString()}`});

            (async()=>
            {
                await this._service.UpdateDatabaseSchemaAsync(db);

            })();

            return this.OK({Message : `The database ${name} is updating`});    
            
    }


    @GET("update")
    public async UpdateDatabaseAsync(@FromQuery() name: string) : Promise<ActionResult>
    {
        let db = await this._service.GetDabaseAsync(name);

        if (!db)           
            return this.NotFound();  
        
        if(db.Status == DababaseStatus.UPDATING)
            return this.OK({Message : `The database ${name} is already updating`});
    
        if(db.Status == DababaseStatus.CREATED || db.Status == DababaseStatus.UPDATED || db.Status == DababaseStatus.UPDATEFAIL)
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

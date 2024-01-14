import 'ts_linq_base';
import '../extensions';


import { Application, IApplicationConfiguration, DependecyService, BodyParseException } from 'web_api_base';
import DBContext from '../data/DBContext';

import AbstractUserService from '@contracts/AbstractUserService';
import UserService from '../services/UserService';

import AbstractJobRoleService from '@contracts/AbstractJobRoleService';
import JobRoleService from '../services/JobRoleService';

import AbstractFileService from '@non-core-contracts/AbstractFileService';
import FileService from '../services/FileService';

import AbstractCheckpointService from '@contracts/AbstractCheckpointService';
import CheckpointService from '../services/CheckpointService';

import AbstractCompanyService from '@contracts/AbstractCompanyService';
import CompanyService from '../services/CompanyService';

import AbstractJorneyService from '@contracts/AbstractJorneyService';
import JourneyService from '../services/JourneyService';

import AbstractTimeService from '@contracts/AbstractTimeService';
import TimeService  from "../services/TimeService";

import AbstractDepartamentService from '@contracts/AbstractDepartamentService';
import DepartamentService  from "../services/DepartamentService";

import AcessService from '../services/AcessService';
import  AbstractAccessService  from '@contracts/AbstractAccessService';
import  AbstractAppointmentService  from '@contracts/AbstractAppointmentService';
import AppointmentService from '../services/AppointmentService';
import  ControlContext  from '../data/ControlContext';
import  DatabaseService  from '../services/DatabaseService';
import AbstractDatabaseService from '@non-core-contracts/AbstractDatabaseService';
import InvalidEntityException from '../exceptions/InvalidEntityException';
import EntityNotFoundException from '../exceptions/EntityNotFoundException';


import { ApplicationExceptionHandler } from 'web_api_base/dist/interfaces/IApplication';
import AbstractDBContext from '@data-contracts/AbstractDBContext';
import AbstractControlContext from '@data-contracts/AbstractControlContext';
import AbstractMultiPartRequestService from '@non-core-contracts/AbstractMultiPartRequestService';
import FormidableMultiPartRequestService from '../services/FormidableMultiPartRequestService';


export default class App extends Application
{

    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {             
        this.UseCors();

        await this.UseControllersAsync();        

        if(Application.Configurations.DEBUG)
            this.CreateDocumentation();
       
        this.ApplicationThreadExeptionHandler = this.ApplicationThreadExeptionEvent;

        appConfig.AddScoped(AbstractDBContext, DBContext);
        appConfig.AddScoped(AbstractControlContext, ControlContext);          
        appConfig.AddScoped(AbstractMultiPartRequestService, FormidableMultiPartRequestService); 
        appConfig.AddScoped(AbstractUserService, UserService);
        appConfig.AddScoped(AbstractDepartamentService, DepartamentService);
        appConfig.AddScoped(AbstractJobRoleService, JobRoleService);       
        appConfig.AddScoped(AbstractCheckpointService, CheckpointService);
        appConfig.AddScoped(AbstractFileService, FileService);
        appConfig.AddScoped(AbstractCompanyService, CompanyService);
        appConfig.AddScoped(AbstractJorneyService, JourneyService);        
        appConfig.AddScoped(AbstractTimeService, TimeService);
        appConfig.AddScoped(AbstractAccessService, AcessService);
        appConfig.AddScoped(AbstractAppointmentService, AppointmentService);
        appConfig.AddScoped(AbstractDatabaseService, DatabaseService);       

        (async()=>{

            await DependecyService.Resolve<AbstractControlContext>(AbstractControlContext)?.UpdateDatabaseAsync();

            if(Application.Configurations.DEBUG){
                let dbService = DependecyService.Resolve<AbstractDatabaseService>(AbstractDatabaseService);

                let dbName = "development";
                
                let db = await dbService?.GetDabaseAsync(dbName);
                if(!db)
                    await dbService!.CreateDabaseAsync(dbName);
                else
                    await dbService!.UpdateDatabaseSchemaAsync(db);
            }

        })();
       
    }

    protected ApplicationThreadExeptionEvent : ApplicationExceptionHandler =  (request, response, exception) => 
    {
        if(exception instanceof InvalidEntityException || BodyParseException)
        {
            response.status(400);
            response.json({Message : exception.Message});
            return;
        }

        if(exception instanceof EntityNotFoundException)
        {
            response.status(404);
            response.json({Message : exception.Message});
            return;
        }

        console.error(exception);
        response.status(500);

        if(Application.Configurations.DEBUG)
            response.json(exception); 
        else
            response.json({Message: "Error while processing the request"});
    }      
    
}


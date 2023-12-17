import 'ts_linq_base';
import '../extensions';


import { Application, IApplicationConfiguration, DependecyService } from 'web_api_base';
import DBContext from '../data/DBContext';

import AbstractUserService from '../core/abstractions/AbstractUserService';
import UserService from '../services/UserService';

import AbstractPermissionService from '../core/abstractions/AbstractPermissionService';
import PermissionService from '../services/PermissionService';

import AbstractJobRoleService from '../core/abstractions/AbstractJobRoleService';
import JobRoleService from '../services/JobRoleService';

import AbstractFileService from '../services/abstractions/AbstractFileService';
import FileService from '../services/FileService';

import AbstractCheckpointService from '../core/abstractions/AbstractCheckpointService';
import CheckpointService from '../services/CheckpointService';

import AbstractCompanyService from '../core/abstractions/AbstractCompanyService';
import CompanyService from '../services/CompanyService';

import AbstractJorneyService from '../core/abstractions/AbstractJorneyService';
import JourneyService from '../services/JourneyService';

import AbstractTimeService from '../core/abstractions/AbstractTimeService';
import TimeService  from "../services/TimeService";

import AbstractDepartamentService from '../core/abstractions/AbstractDepartamentService';
import DepartamentService  from "../services/DepartamentService";

import AcessService from '../services/AcessService';
import  AbstractAccessService  from '../core/abstractions/AbstractAccessService';
import  AbstractAppointmentService  from '../core/abstractions/AbstractAppointmentService';
import AppointmentService from '../services/AppointmentService';
import  ControlContext  from '../data/ControlContext';
import  DatabaseService  from '../services/DatabaseService';
import AbstractDatabaseService from '../services/abstractions/AbstractDatabaseService';
import InvalidEntityException from '../exceptions/InvalidEntityException';
import EntityNotFoundException from '../exceptions/EntityNotFoundException';


import { ApplicationExceptionHandler } from 'web_api_base/dist/interfaces/IApplication';
import AbstractDBContext from '../data/abstract/AbstractDBContext';
import AbstractControlContext from '../data/abstract/AbstractControlContext';
import AbstractMultiPartRequestService from '../services/abstractions/AbstractMultiPartRequestService';
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

        process.env["ROOT"] = appConfig.RootPath; 

        appConfig.AddScoped(AbstractUserService, UserService);
        appConfig.AddScoped(AbstractDepartamentService, DepartamentService);
        appConfig.AddScoped(AbstractPermissionService, PermissionService);
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
            await DependecyService.Resolve<AbstractControlContext>(ControlContext)?.UpdateDatabaseAsync();
        })();
       
    }

    protected ApplicationThreadExeptionEvent : ApplicationExceptionHandler =  (request, response, exception) => 
    {
        if(exception instanceof InvalidEntityException)
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


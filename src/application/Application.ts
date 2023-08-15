import { Application, IApplicationConfiguration, DependecyService } from 'web_api_base';
import Context from '../data/Context';

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
import TimeService  from "../services/TimeService";

import AbstractPeriodService from '../core/abstractions/AbstractPeriodService';
import PeriodService from '../services/PeriodService';
import AbstractTimeService from '../core/abstractions/AbstractTimeService';


export default class App extends Application
{

    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {       
        this.UseCors();

        this.UseControllers();     

        appConfig.AddScoped(Context);

        process.env["ROOT"] = appConfig.EnviromentVariables["ROOT"];

        appConfig.AddScoped(AbstractUserService, UserService);
        appConfig.AddScoped(AbstractPermissionService, PermissionService);
        appConfig.AddScoped(AbstractJobRoleService, JobRoleService);       
        appConfig.AddScoped(AbstractCheckpointService, CheckpointService);
        appConfig.AddScoped(AbstractFileService, FileService);
        appConfig.AddScoped(AbstractCompanyService, CompanyService);
        appConfig.AddScoped(AbstractJorneyService, JourneyService);
        appConfig.AddScoped(AbstractPeriodService, PeriodService);
        appConfig.AddScoped(AbstractTimeService, TimeService);
       
        if(process.env.ENVIROMENT != 'DEBUG'){       
            await DependecyService.ResolveCtor(Context)!.UpdateDatabaseAsync();
        }    
       
    }
    
}
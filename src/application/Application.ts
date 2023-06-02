import { Application, IApplicationConfiguration, DependecyService } from 'web_api_base';
import Context from '../data/Context';

import AbstractUserService from '../core/abstractions/AbstractUserService';
import UserService from '../services/UserService';

import AbstractPermissionService from '../core/abstractions/AbstractPermissionService';
import PermissionService from '../services/PermissionService';

import AbstractJobRoleService from '../core/abstractions/AbstractJobRoleService';
import JobRoleService from '../services/JobRoleService';

import AbstractEmployerService from '../core/abstractions/AbstractEmployerService';
import EmployerService from '../services/EmployerService';


import AbstractFileService from '../services/abstractions/AbstractFileService';
import FileService from '../services/FileService';

import PermissionSeed from '../seeds/PermissionSeed';
import UserSeed from '../seeds/UserSeed';
import JobRoleSeed from '../seeds/JobRoleSeed';
import EmployerSeed from '../seeds/EmployerSeed';
import AbstractCheckpointService from '../core/abstractions/AbstractCheckpointService';
import CheckpointService from '../services/CheckpointService';

export default class App extends Application
{

    public override async ConfigureAsync(appConfig: IApplicationConfiguration): Promise<void>
    {       
        this.UseCors();

        this.UseControllers();     

        appConfig.AddScoped(Context);

        appConfig.AddScoped(AbstractUserService, UserService);
        appConfig.AddScoped(AbstractPermissionService, PermissionService);
        appConfig.AddScoped(AbstractJobRoleService, JobRoleService);
        appConfig.AddScoped(AbstractEmployerService, EmployerService);
        appConfig.AddScoped(AbstractCheckpointService, CheckpointService);
        appConfig.AddScoped(AbstractFileService, FileService);
       
        await DependecyService.ResolveCtor(Context)!.UpdateDatabaseAsync();
        
        await new PermissionSeed(DependecyService.ResolveCtor(AbstractPermissionService)).SeedAsync();
        await new JobRoleSeed(DependecyService.ResolveCtor(AbstractJobRoleService)).SeedAsync();
        await new UserSeed(DependecyService.ResolveCtor(AbstractUserService), DependecyService.ResolveCtor(AbstractPermissionService)).SeedAsync();
        await new EmployerSeed(DependecyService.ResolveCtor(AbstractEmployerService), DependecyService.ResolveCtor(AbstractJobRoleService), DependecyService.ResolveCtor(AbstractCheckpointService)).SeedAsync();
       
    }
    
}
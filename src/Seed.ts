
import PermissionSeed from './seeds/PermissionSeed';
import UserSeed from './seeds/UserSeed';
import JobRoleSeed from './seeds/JobRoleSeed';
import Context from './data/Context';
import CompanySeed from './seeds/CompanySeed';
import DepartamentSeed from './seeds/DepartamentSeed';
import PeriodSeed from './seeds/PeriodSeed';
import { ApplicationConfiguration } from 'web_api_base';


(async ()=>
{
    console.log("Starting seed");

    await new ApplicationConfiguration().LoadAsync();

    let context = new Context();   
    
    context["_manager"].SetLogger((msg, _) => console.log(msg));

    await context.UpdateDatabaseAsync();

    await new CompanySeed(context).SeedAsync();
    await new DepartamentSeed(context).SeedAsync();
    await new JobRoleSeed(context).SeedAsync();
    await new PeriodSeed(context).SeedAsync();    
    await new PermissionSeed(context).SeedAsync();    
    await new UserSeed(context).SeedAsync();

    console.log("Seed process finished");

})();

import PermissionSeed from './seeds/PermissionSeed';
import UserSeed from './seeds/UserSeed';
import JobRoleSeed from './seeds/JobRoleSeed';
import PermissionService from './services/PermissionService';
import Context from './data/Context';
import JobRoleService from './services/JobRoleService';
import UserService from './services/UserService';


(async ()=>
{
    console.log("Starting seed");

    let context = new Context();
    let permissonService = new PermissionService(context);
    let jobRoleService = new JobRoleService(context);
    let userService = new UserService(context);

    await new PermissionSeed(permissonService).SeedAsync();
    await new JobRoleSeed(jobRoleService).SeedAsync();
    await new UserSeed(userService, permissonService, jobRoleService).SeedAsync();


    console.log("Seed process finished");

})();
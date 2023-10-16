import { Inject } from 'web_api_base';
import Context from '../data/Context';
import  ControlContext  from '../data/ControlContext';
import Database, { DababaseStatus } from '../core/entities/Database';
import Access from '../core/entities/Access';
import User from '../core/entities/User';
import AbstractDatabaseService from './abstractions/AbstractDatabaseService';
import { MD5 } from '../utils/Cryptography';


export default class DatabaseService extends AbstractDatabaseService{
   
   
    @Inject()
    private _context: Context;

    @Inject()
    private _controlContext: ControlContext;

    constructor(context: Context, controlContext: ControlContext) {

        super();
        this._context = context;
        this._controlContext = controlContext;
    }

    public override async GetAllDabasesAsync() : Promise<Database[]>
    {
        return this._controlContext.Databases.ToListAsync();
    }

    public override async UpdateDatabaseAsync(db: Database): Promise<void> {
        
        await this._controlContext.Databases.UpdateAsync(db);
    }

    public override async GetDabaseAsync(dabataseName : string) : Promise<Database | undefined>
    {
        return this._controlContext.Databases.WhereField("Name").IsEqualTo(dabataseName).FirstOrDefaultAsync();
    }

    public override async CheckIfDatabaseExists(dabataseName : string) : Promise<boolean>
    {
        return (await this._controlContext.Databases.ToListAsync()).filter(s => s.Name == dabataseName && s.Status == DababaseStatus.CREATED).length > 0;
    }

    public override async UpdateDatabaseSchemaAsync(db: Database): Promise<void> 
    {
        if(db.Status == DababaseStatus.CREATED || db.Status == DababaseStatus.UPDATED)
        {
            db.Status = DababaseStatus.UPDATING;

            await this._controlContext.Databases.UpdateAsync(db);

            try{

                await this._context.UpdateDatabaseAsync();
                db.Status = DababaseStatus.UPDATED;                

            }catch(err)
            {
                db.Status = DababaseStatus.UPDATEFAIL;
                db.Warning = (err as any).message;
            }
            
            db.LasUpdate = new Date();
            await this._controlContext.Databases.UpdateAsync(db);
        }
    }

    public override async CreateDabaseAsync(dabataseName: string): Promise<void> {
        let db = await this._controlContext.Databases.Where({ Field: 'Name', Value: dabataseName }).FirstOrDefaultAsync();

        if (!db || db.Status == DababaseStatus.DELETED) {

            await this._context["_manager"].CreateDataBase(dabataseName);            

            await this._context.SetDatabaseAsync(dabataseName);

            let newDb = new Database(dabataseName);

            await this._controlContext.Databases.AddAsync(newDb);

            await this._context.UpdateDatabaseAsync();

            newDb.Status = DababaseStatus.CREATED;

            await this._controlContext.Databases.UpdateAsync(newDb);     
            
            await this.CreateDefaultUserAsync(dabataseName);

        }
    }    



    public override async CreateDefaultUserAsync(dabataseName : string) : Promise<void>
    {
        let user = Reflect.construct(User, []) as User;

        user.Name = dabataseName;            

        user.Access = new Access(user, dabataseName, MD5(`${dabataseName}123`));

        user.IsSuperUser = true;
        
        await this._context.SetDatabaseAsync(dabataseName);

        await this._context.Users.AddAsync(user);
    }

}

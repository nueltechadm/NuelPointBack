import { Inject } from 'web_api_base';
import Database, { DababaseStatus } from '@entities/Database';
import Access, { PERFILTYPE } from '@entities/Access';
import User from '@entities/User';
import AbstractDatabaseService from './abstractions/AbstractDatabaseService';
import { MD5 } from '@utils/Cryptography';
import AbstractControlContext from '@data-contracts/AbstractControlContext';
import AbstractDBContext from '@data-contracts/AbstractDBContext';


export default class DatabaseService extends AbstractDatabaseService
{


    @Inject()
    private _context: AbstractDBContext;

    @Inject()
    private _controlContext: AbstractControlContext;

    constructor(context: AbstractDBContext, controlContext: AbstractControlContext)
    {

        super();
        this._context = context;
        this._controlContext = controlContext;
    }

    public async GetAllDabasesAsync(): Promise<Database[]>
    {
        return this._controlContext.Collection(Database).ToListAsync();
    }

    public async UpdateDatabaseAsync(db: Database): Promise<void>
    {

        await this._controlContext.Collection(Database).UpdateAsync(db);
    }

    public async GetDabaseAsync(dabataseName: string): Promise<Database | undefined>
    {
        return this._controlContext.Collection(Database).WhereField("Name").IsEqualTo(dabataseName.Trim()).FirstOrDefaultAsync();
    }

    public async CheckIfDatabaseExists(dabataseName: string): Promise<boolean>
    {
        return (await this._controlContext.Collection(Database).ToListAsync()).filter(s => s.Name == dabataseName.Trim() && s.Status == DababaseStatus.CREATED).length > 0;
    }

    public async UpdateDatabaseSchemaAsync(db: Database): Promise<void> 
    {
        db.Status = DababaseStatus.UPDATING;
        db.Warning = "";

        await this._controlContext.Collection(Database).UpdateAsync(db);

        try
        {

            await this._context.SetDatabaseAsync(db.Name);
            await this._context.UpdateDatabaseAsync();
            db.Status = DababaseStatus.UPDATED;

        } catch (err)
        {
            db.Status = DababaseStatus.UPDATEFAIL;
            db.Warning = (err as any).message;
        }

        db.LasUpdate = new Date();
        await this._controlContext.Collection(Database).UpdateAsync(db);
    }

    public async CreateDabaseAsync(dabataseName: string): Promise<void>
    {


        let db = await this._controlContext.Collection(Database).Where({ Field: 'Name', Value: dabataseName.Trim() }).FirstOrDefaultAsync();

        if (!db) 
        {
            await (this._context as any)["_manager"].CreateDataBaseAsync(dabataseName);

            await this._context.SetDatabaseAsync(dabataseName);

            let newDb = new Database(dabataseName);

            await this._controlContext.Collection(Database).AddAsync(newDb);

            try
            {

                await this._context.UpdateDatabaseAsync();

            } catch (err)
            {
                db = await this._controlContext.Collection(Database).Where({ Field: 'Name', Value: dabataseName }).FirstOrDefaultAsync();

                if (db)
                {
                    db.Status = DababaseStatus.UPDATEFAIL;
                    db.Warning = (err as any).message;
                }
            }

            newDb.Status = DababaseStatus.CREATED;

            await this._controlContext.Collection(Database).UpdateAsync(newDb);

            await this.CreateDefaultUserAsync(dabataseName);

        }
    }



    public async CreateDefaultUserAsync(dabataseName: string): Promise<void>
    {
        let user = Reflect.construct(User, []) as User;

        user.Name = dabataseName.Trim();

        user.Access = new Access(user, dabataseName, MD5(`${dabataseName}123`), PERFILTYPE.SUPER);

        await this._context.SetDatabaseAsync(dabataseName);

        await this._context.Collection(User).AddAsync(user);
    }

}

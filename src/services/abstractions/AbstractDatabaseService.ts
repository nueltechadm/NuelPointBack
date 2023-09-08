import Database from "../../core/entities/Database";


export default abstract class AbstractDatabaseService {

    public abstract GetAllDabasesAsync(): Promise<Database[]>;

    public abstract UpdateDatabaseAsync(db : Database): Promise<void>;

    public abstract GetDabaseAsync(dabataseName: string): Promise<Database | undefined>;

    public abstract CheckIfDatabaseExists(dabataseName: string): Promise<boolean>;

    public abstract CreateDabaseAsync(dabataseName: string): Promise<void>;

    public abstract CreateDefaultUserAsync(dabataseName: string): Promise<void>;

}

import {Inject} from'web_api_base'
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import Checkpoint from "../core/entities/Checkpoint";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import { Operation } from "myorm_core";
import Path from 'path';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Company from "../core/entities/Company";
import User from "../core/entities/User";
import AbstractDBContext from "../data/abstract/AbstractDBContext";

export default class CheckpointService  extends AbstractCheckpointService
{   
   
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public override async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public async CountAsync(): Promise<number> {        
        return await this._context.Collection(Checkpoint).CountAsync();
    }

    public override async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Checkpoint).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public override async GetFolderAndFileName(checkpoint: Checkpoint): Promise<{ Folder: string; File: string; }> {
       
        if(!this.IsCompatible(checkpoint))
            throw new InvalidEntityException(`This object is not of ${Checkpoint.name} type`);

        if(!checkpoint.User)
            throw new InvalidEntityException(`User is required`);

        let company : Company;

        if(!checkpoint.User.Company)
        {
            let r = await this._context.Join(Company, User)
                                       .On(Company, "Users", User, "Company")
                                       .Where(User, {Field: "Id", Value : checkpoint.User.Id})
                                       .Select(Company)
                                       .ToListAsync();

            if(r.length == 0)
                throw new InvalidEntityException(`The user of this checkpoint has no company`);
            
            company = r[0];
        }
        else 
            company = checkpoint.User.Company!;

        let uId = checkpoint.User.Id;
        let cId = company.Id;        
        let folder = Path.join(process.env["ROOT"]!.toString(), `_${cId}_` ,`_${uId}_`);
        let file = Path.join(folder, `_${checkpoint.Id}_.png`);

        return Promise.resolve({ Folder : folder, File : file});
    }
    
    public override IsCompatible(obj: any): obj is Checkpoint {
        
        return ("User" in obj || "UserId" in obj) && "X" in obj && "Y" in obj;  
    }
   
    public override async GetByIdAsync(id: number): Promise<Checkpoint | undefined> {       
        return await this._context.Collection(Checkpoint).WhereField("Id").IsEqualTo(id).LoadRelationOn("User").FirstOrDefaultAsync();
    }
    
    public override async AddAsync(obj: Checkpoint): Promise<Checkpoint> {        

        this.ValidateObject(obj);

        if(!obj.User.Company)
            throw new InvalidEntityException(`The user of this checkpoint has no company`);

        return this._context.Collection(Checkpoint).AddAsync(obj);
    }
    public override async UpdateAsync(obj: Checkpoint): Promise<Checkpoint> {

        this.ValidateObject(obj);
        
        return await this._context.Collection(Checkpoint).UpdateAsync(obj);
    }

    public override async UpdateObjectAndRelationsAsync<U extends keyof Checkpoint>(obj: Checkpoint, relations: U[]): Promise<Checkpoint> {

        this.ValidateObject(obj);

        return await this._context.Collection(Checkpoint).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public override async GetByAndLoadAsync<K extends keyof Checkpoint>(key: K, value: Checkpoint[K], load: K[]): Promise<Checkpoint[]> 
    {
       this._context.Collection(Checkpoint).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Checkpoint).Join(l);
        
       return await this._context.Collection(Checkpoint).ToListAsync();
    } 


    public override async DeleteAsync(obj: Checkpoint): Promise<Checkpoint> {
        return this._context.Collection(Checkpoint).DeleteAsync(obj);
    }


    public override async GetAllAsync(): Promise<Checkpoint[]> {
        return await this._context.Collection(Checkpoint).OrderDescendingBy("Date").ToListAsync();
    }  

    public override async GetByRangeAndEmployer(userId: number, begin: Date, end?: Date | undefined): Promise<Checkpoint[]> {

        let user = await this._context.Collection(User).WhereField("Id").IsEqualTo(userId).FirstOrDefaultAsync();

        if(!user)
            throw new EntityNotFoundException(`Has no one employer with id: #${userId} in the database`);

       return await this._context.Collection(Checkpoint)
       .Where({
            Field : "User", 
            Value : user!})
       .And({
            Field : "Date", 
            Kind : Operation.GREATHEROREQUALS, 
            Value : begin})
        .And({
            Field : "Date", 
            Kind : Operation.SMALLEROREQUALS, 
            Value : end ?? new Date()})    
        .Join("User")
        .OrderDescendingBy("Date")
        .ToListAsync();
    }

    public override ValidateObject(obj: Checkpoint) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`This object is not of ${Checkpoint.name} type`);

        if(!obj.User)
            throw new InvalidEntityException(`User of checkpoint is required`);

        if(!obj.X)
            throw new InvalidEntityException(`X point of checkpoint is required`);

        if(!obj.Y)
            throw new InvalidEntityException(`Y point of checkpoint is required`);   
    }

}






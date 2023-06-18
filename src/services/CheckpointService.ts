import Context from "../data/Context";
import {Inject} from'web_api_base'
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import Checkpoint from "../core/entities/Checkpoint";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import { Operation } from "myorm_pg";
import Path from 'path';
import InvalidEntityException from "../exceptions/InvalidEntityException";

export default class CheckpointService  extends AbstractCheckpointService
{   
   
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public async CountAsync(): Promise<number> {
        
        return await this._context.Checkpoints.CountAsync();
    }

    public override async GetFolderAndFileName(checkpoint: Checkpoint): Promise<{ Folder: string; File: string; }> {
       
        let uId = checkpoint.User.Id;        
        let folder = Path.join(process.env["ROOT"]!.toString(), `_${uId}_`);
        let file = Path.join(folder, `_${checkpoint.Id}.png`);

        return Promise.resolve({ Folder : folder, File : file});
    }
    
    public override IsCompatible(obj: any): obj is Checkpoint {
        
        return ("User" in obj || "UserId" in obj) && "X" in obj && "Y" in obj;  
    }
   
    public async GetByIdAsync(id: number): Promise<Checkpoint | undefined> {       
        return await this._context.Checkpoints.WhereField("Id").IsEqualTo(id).AndLoadAll("User").AndLoadAll("Period").FirstOrDefaultAsync();
    }
    
    public async AddAsync(obj: Checkpoint): Promise<Checkpoint> {        

        this.CommomValidations(obj);

        return this._context.Checkpoints.AddAsync(obj);
    }
    public async UpdateAsync(obj: Checkpoint): Promise<Checkpoint> {

        this.CommomValidations(obj);
        
        return this._context.Checkpoints.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Checkpoint): Promise<Checkpoint> {
        return this._context.Checkpoints.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Checkpoint[]> {
        return await this._context.Checkpoints.OrderDescendingBy("Date").ToListAsync();
    }  

    public async GetByRangeAndEmployer(userId: number, begin: Date, end?: Date | undefined): Promise<Checkpoint[]> {

        let user = await this._context.Users.WhereField("Id").IsEqualTo(userId).FirstOrDefaultAsync();

        if(!user)
            throw new EntityNotFoundException(`Has no one employer with id: #${userId} in the database`);

       return await this._context.Checkpoints
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
        .Join("Period")
        .OrderDescendingBy("Date")
        .ToListAsync();
    }

    private CommomValidations(obj: Checkpoint) : void
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

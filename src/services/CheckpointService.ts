import Context from "../data/Context";
import {Inject} from'web_api_base'
import AbstractCheckpointService from "../core/abstractions/AbstractCheckpointService";
import Checkpoint from "../core/entities/Checkpoint";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import { Operation } from "myorm_pg";

export default class CheckpointService  extends AbstractCheckpointService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public async GetByIdAsync(id: number): Promise<Checkpoint | undefined> {       
        return await this._context.Checkpoints.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    
    public async AddAsync(obj: Checkpoint): Promise<Checkpoint> {
        return this._context.Checkpoints.AddAsync(obj);
    }
    public async UpdateAsync(obj: Checkpoint): Promise<Checkpoint> {
        return this._context.Checkpoints.UpdateAsync(obj);
    }
    public async DeleteAsync(obj: Checkpoint): Promise<Checkpoint> {
        return this._context.Checkpoints.DeleteAsync(obj);
    }
    public async GetAllAsync(): Promise<Checkpoint[]> {
        return await this._context.Checkpoints.OrderDescendingBy("Date").ToListAsync();
    }  

    public async GetByRangeAndEmployer(employer: number, begin: Date, end?: Date | undefined): Promise<Checkpoint[]> {

        let emp = await this._context.Employers.WhereField("Id").IsEqualTo(employer).FirstOrDefaultAsync();

        if(!emp)
            throw new EntityNotFoundException(`Has no one employer with id: #${employer} in the database`);

       return await this._context.Checkpoints
       .Where({
            Field : "Employer", 
            Value : emp!})
       .And({
            Field : "Date", 
            Kind : Operation.GREATHEROREQUALS, 
            Value : begin})
        .And({
            Field : "Date", 
            Kind : Operation.SMALLEROREQUALS, 
            Value : end ?? new Date()})    
        .OrderDescendingBy("Date")
        .ToListAsync();
    }
}

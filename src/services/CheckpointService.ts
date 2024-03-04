import {Inject} from'web_api_base'
import AbstractCheckpointService from "@contracts/AbstractCheckpointService";
import Checkpoint from "@entities/Checkpoint";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";
import { Operation } from "myorm_core";
import Path from 'path';
import InvalidEntityException from "../exceptions/InvalidEntityException";
import Company from "@entities/Company";
import User from "@entities/User";
import AbstractDBContext from "@data-contracts/AbstractDBContext";
import { PaginatedFilterResult, PaginatedFilterRequest } from '@contracts/AbstractService';

export default class CheckpointService  extends AbstractCheckpointService
{   
   
    @Inject()
    private _context : AbstractDBContext;

    constructor(context : AbstractDBContext)
    {
        super();
        this._context = context;
    }

    public async SetClientDatabaseAsync(client: string): Promise<void> {       
        await this._context.SetDatabaseAsync(client);
    }

    public async CountAsync(): Promise<number> {        
        return await this._context.Collection(Checkpoint).CountAsync();
    }

    public async ExistsAsync(id: number): Promise<boolean> {
        
        return (await this._context.Collection(Checkpoint).WhereField("Id").IsEqualTo(id).CountAsync()) > 0;
    }

    public async GetFolderAndFileName(checkpoint: Checkpoint): Promise<{ Folder: string; File: string; }> {
       
        if(!this.IsCompatible(checkpoint))
            throw new InvalidEntityException(`This object is not of ${Checkpoint.name} type`);

        if(!checkpoint.User)
            throw new InvalidEntityException(`User is required`);

        let company : Company;

        if(!checkpoint.User.Company)
        {
            let r = await this._context.From(Company)
                                       .InnerJoin(User)
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
    
    public IsCompatible(obj: any): obj is Checkpoint {
        
        return ("User" in obj || "UserId" in obj) && "X" in obj && "Y" in obj;  
    }
   
    public async GetByIdAsync(id: number): Promise<Checkpoint | undefined> {       
        return await this._context.Collection(Checkpoint).WhereField("Id").IsEqualTo(id).LoadRelationOn("User").FirstOrDefaultAsync();
    }
    
    public async AddAsync(obj: Checkpoint): Promise<Checkpoint> {        

        this.ValidateObject(obj);

        if(!obj.User.Company)
            throw new InvalidEntityException(`The user of this checkpoint has no company`);

        return this._context.Collection(Checkpoint).AddAsync(obj);
    }
    public async UpdateAsync(obj: Checkpoint): Promise<Checkpoint> {

        this.ValidateObject(obj);
        
        return await this._context.Collection(Checkpoint).UpdateAsync(obj);
    }

    public async UpdateObjectAndRelationsAsync<U extends keyof Checkpoint>(obj: Checkpoint, relations: U[]): Promise<Checkpoint> {

        this.ValidateObject(obj);

        return await this._context.Collection(Checkpoint).UpdateObjectAndRelationsAsync(obj, relations);
    }


    public async GetByAndLoadAsync<K extends keyof Checkpoint>(key: K, value: Checkpoint[K], load: (keyof Checkpoint)[]): Promise<Checkpoint[]> 
    {
       this._context.Collection(Checkpoint).Where({Field : key, Value : value});

       for(let l of load)
            this._context.Collection(Checkpoint).Load(l);
        
       return await this._context.Collection(Checkpoint).ToListAsync();
    } 


    public async DeleteAsync(obj: Checkpoint): Promise<Checkpoint> {
        return this._context.Collection(Checkpoint).DeleteAsync(obj);
    }

    public async PaginatedFilterAsync(request : PaginatedFilterRequest) : Promise<PaginatedFilterResult<Checkpoint>> 
    {
        let offset = (request.Page - 1) * request.Quantity;  

        let total = await this._context.Collection(Checkpoint).CountAsync();

        let checkpoints = await this._context.Collection(Checkpoint).OrderBy("Date").Offset(offset).Limit(request.Quantity).ToListAsync();

        let result = new PaginatedFilterResult<Checkpoint>();
        result.Page = request.Page;
        result.Quantity = checkpoints.Count();
        result.Total = total;
        result.Result = checkpoints;

        return result;
    }
   

    public async GetByRangeAndEmployer(userId: number, begin: Date, end?: Date | undefined): Promise<Checkpoint[]> {

        let user = await this._context.Collection(User).WhereField("Id").IsEqualTo(userId).FirstOrDefaultAsync();

        if(!user)
            throw new EntityNotFoundException(`Não tem funcionario com Id: #${userId} no banco de dados`);

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
        .Load("User")
        .OrderDescendingBy("Date")
        .ToListAsync();
    }

    public ValidateObject(obj: Checkpoint) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`Este objeto não é do tipo ${Checkpoint.name}`);

        if(!obj.User)
            throw new InvalidEntityException(`Usuário do ponto é necessário`);

        if(!obj.X)
            throw new InvalidEntityException(`Cordenada X do ponto é necessária`);

        if(!obj.Y)
            throw new InvalidEntityException(`Cordenada Y do ponto é necessária`);   
    }

}






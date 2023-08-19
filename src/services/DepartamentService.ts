import AbstractDepartamentService from "../core/abstractions/AbstractDepartamentService";
import Context from "../data/Context";
import {Inject} from'web_api_base'
import Type from "../utils/Type";
import Departament from "../core/entities/Departament";
import InvalidEntityException from "../exceptions/InvalidEntityException";
import EntityNotFoundException from "../exceptions/EntityNotFoundException";



export default class DepartamentService  extends AbstractDepartamentService
{
    
    @Inject()
    private _context : Context;

    constructor(context : Context)
    {
        super();
        this._context = context;
    }

    public override IsCompatible(obj: any): obj is Departament {        
        return Type.HasKeys<Departament>(obj, "Name", "Company");  
    }

    public override async CountAsync(): Promise<number> {
        
        return await this._context.Departaments.CountAsync();
    }

    public override async GetByIdAsync(id: number): Promise<Departament | undefined> {       
        return await this._context.Departaments.WhereField("Id").IsEqualTo(id).FirstOrDefaultAsync();
    }
    
    public override async AddAsync(obj: Departament): Promise<Departament> {

        this.ValidateObject(obj);

        if(!obj.Company)
            throw new InvalidEntityException(`The company of ${Departament.name} is required`); 

        return this._context.Departaments.AddAsync(obj);
    }
    public override async UpdateAsync(obj: Departament): Promise<Departament> {

        this.ValidateObject(obj);

        return this._context.Departaments.UpdateAsync(obj);
    }
    public override async DeleteAsync(obj: Departament): Promise<Departament> {
        
        if(!obj.Id || obj == undefined)
            throw new InvalidEntityException(`Id is required to delete a ${Departament.name}`);

        let curr = await this._context.Departaments.Where({ Field : "Id", Value : obj.Id}).FirstOrDefaultAsync();
        
        if(!curr)
            throw new EntityNotFoundException(`Has no one ${Departament.name} with Id #${obj.Id} in database`);

        return this._context.Departaments.DeleteAsync(curr);
    }
    public override async GetAllAsync(): Promise<Departament[]> {
        return await this._context.Departaments.OrderBy("Name").ToListAsync();
    }  

    public override ValidateObject(obj: Departament) : void
    {
        if(!this.IsCompatible(obj))
            throw new InvalidEntityException(`The object is not of ${Departament.name} type`);

        if(!obj.Name)
            throw new InvalidEntityException(`The name of ${Departament.name} is required`);
       
    }
}

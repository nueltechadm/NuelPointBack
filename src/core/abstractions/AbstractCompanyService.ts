import Company from "../entities/Company";
import Departament from "../entities/Departament";
import AbstractService from "./AbstractService";

export default abstract class AbstractCompanyService extends AbstractService<Company>
{
    abstract GetByIdAsync(id : number) : Promise<Company | undefined>;    
    abstract GetByNameAsync(name : string) : Promise<Company | undefined>;   
    abstract AddDepartamentToAllAsync(departament : Departament) : Promise<void>;   
    abstract FilterAsync(params : FilterParamas) : Promise<Company[]>

}

export class FilterParamas
{
    Description? : string = undefined;
    Name? : string = undefined;
    Document? : string = undefined;
    Active? : boolean = undefined;
    Quantity : number = 10;
    Page: number = 1;

    public static GetTemplate() : FilterParamas
    {
        let template = new FilterParamas();
        template.Active = false;
        template.Description = "Description";
        template.Document = "Document";
        template.Name = "Name";
        template.Page = 1;
        template.Quantity = 10;
        return template;
    }
}
import Company from "../entities/Company";
import Departament from "../entities/Departament";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";

export default abstract class AbstractCompanyService extends AbstractService<Company, CompanyPaginatedFilterRequest, CompanyPaginatedFilterResponse>
{
    abstract GetByIdAsync(id : number) : Promise<Company | undefined>;    
    abstract GetByNameAsync(name : string) : Promise<Company[]>;   
    abstract AddDepartamentToAllAsync(departament : Departament) : Promise<void>;       

}

export /*sealed*/ class CompanyPaginatedFilterRequest extends PaginatedFilterRequest
{
    Description? : string = undefined;
    Name : string = "";
    Document : string = "";
    Active : boolean = false;   

    constructor()
    {
        super();
    }
    
}


export /*sealed*/ class CompanyPaginatedFilterResponse extends PaginatedFilterResult<Company>
{
    constructor(companies : Company[], quantity : number, total : number, page : number)
    {
        super();
        this.Page = page;
        this.Quantity = quantity;
        this.Total = total;
        this.Result = companies;
    }
}
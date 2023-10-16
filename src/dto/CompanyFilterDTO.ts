import Company from "../core/entities/Company";

export class CompanyFilterDTO
{
    public Result : Company[];
    public Quantity : number;
    public Total: number;
    public Page: number;

    constructor(result : Company[], quantity: number, total : number, page : number)
    {
        this.Page = page;
        this.Quantity = quantity;
        this.Result = result;
        this.Total = total;
    }
}
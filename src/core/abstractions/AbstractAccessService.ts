import Access from "../entities/Access";
import AbstractService from "./AbstractService";



export abstract class AbstractAccessService extends AbstractService<Access>
{
    abstract GetByIdAsync(id: number): Promise<Access | undefined>;

    abstract GetByCompanyIdAsync(id : number)<Access[]>;
}

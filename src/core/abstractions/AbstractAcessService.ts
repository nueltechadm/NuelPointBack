import Access from "../entities/Access";
import AbstractService from "./AbstractService";



export abstract class AbstractAcessService extends AbstractService<Access>
{
    abstract GetByIdAsync(id: number): Promise<Access | undefined>;
}

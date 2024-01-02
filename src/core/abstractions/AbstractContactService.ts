import Contact from "@entities/Contact";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";




export default abstract class AbstractContactService extends AbstractService<Contact, PaginatedFilterRequest, PaginatedFilterResult<Contact>>
{
    abstract GetByIdAsync(id: number): Promise<Contact | undefined>;
}

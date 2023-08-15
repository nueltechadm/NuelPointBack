import Contact from "../entities/Contact";
import AbstractService from "./AbstractService";




export abstract class AbstractContactService extends AbstractService<Contact>
{
    abstract GetByIdAsync(id: number): Promise<Contact | undefined>;
}

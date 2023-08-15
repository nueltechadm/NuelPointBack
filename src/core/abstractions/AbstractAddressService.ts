import Address from "../entities/Address";
import AbstractService from "./AbstractService";




export abstract class AbstractAddressService extends AbstractService<Address>
{
    abstract GetByIdAsync(id: number): Promise<Address | undefined>;
}

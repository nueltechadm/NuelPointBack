import Address from "../entities/Address";
import AbstractService from "./AbstractService";




export default abstract class AbstractAddressService extends AbstractService<Address>
{
    abstract GetByIdAsync(id: number): Promise<Address | undefined>;
}

import Address from "@entities/Address";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";




export default abstract class AbstractAddressService extends AbstractService<Address, PaginatedFilterRequest, PaginatedFilterResult<Address>>
{
    abstract GetByIdAsync(id: number): Promise<Address | undefined>;
}

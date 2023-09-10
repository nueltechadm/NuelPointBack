import { Exception } from "web_api_base";


export default class InvalidEntityException extends Exception
{
    constructor(msg : string)
    {
        super(msg);
    }
}
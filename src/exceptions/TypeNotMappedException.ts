import { Exception } from "web_api_base";


export default class TypeNotMappedException extends Exception
{
    constructor(msg : string)
    {
        super(msg);
    }
}


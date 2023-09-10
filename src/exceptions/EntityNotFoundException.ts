import { Exception } from "web_api_base";


export default class EntityNotFoundException extends Exception
{
    constructor(msg : string)
    {
        super(msg);
    }
}
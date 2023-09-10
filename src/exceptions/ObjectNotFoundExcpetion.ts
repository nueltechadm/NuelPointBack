import { Exception } from "web_api_base";


export default class ObjectNotFoundExcpetion extends Exception
{
    constructor(msg : string)
    {
        super(msg);
    }
}
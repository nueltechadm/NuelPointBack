import { Exception } from "web_api_base";


export default class FileUploadException extends Exception
{
    constructor(msg : string)
    {
        super(msg);
    }
}


import { Exception } from "web_api_base";




export default class FileException extends Exception {
    constructor(msg: string) {
        super(msg);
    }
}



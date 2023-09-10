import { Exception } from "web_api_base";

export default class TokenDecodeException extends Exception {
    constructor(msg: string) {
        super(msg);
    }
}




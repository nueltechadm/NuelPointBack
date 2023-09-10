import { Exception } from "web_api_base";


export default class InvalidTokenException extends Exception {
    constructor(msg: string) {
        super(msg);
    }
}

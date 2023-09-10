import { Exception } from "web_api_base";

export default class DatabaseException extends Exception {
    constructor(msg: string) {
        super(msg);
    }
}

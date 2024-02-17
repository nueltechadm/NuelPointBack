import FileException from "./FileException";



export default class FileCastException extends FileException {
    constructor(msg: string) {
        super(msg);
    }
}

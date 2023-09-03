

export default class InvalidTokenException extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

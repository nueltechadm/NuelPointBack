

export default class InvalidEntityException extends Error
{
    constructor(msg : string)
    {
        super(msg);
    }
}
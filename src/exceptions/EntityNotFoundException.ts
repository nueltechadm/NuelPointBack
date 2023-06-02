

export default class EntityNotFoundException extends Error
{
    constructor(msg : string)
    {
        super(msg);
    }
}
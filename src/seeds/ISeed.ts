
export default abstract class AbstractSeed
{
    abstract SeedAsync() : Promise<void>;
}
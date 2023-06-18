import Checkpoint from "../core/entities/Checkpoint";
import User from "../core/entities/User";


export class CheckpointDTO 
{
    public UserId : number;
    public X : number;
    public Y : number;
    public Picture: string;

    constructor(userId : number, x : number, y : number, picture : string)
    {
        this.UserId = userId;        
        this.X = x;
        this.Y = y;
        this.Picture = picture;
    }

    public MapToCheckpoint(user : User)
    {
        return new Checkpoint(user, this.X, this.Y, this.Picture, user.Company!, user.Period!);
    }

    public static MapToDTO(obj : any) : CheckpointDTO
    {
       let r = Reflect.construct(CheckpointDTO, []);

       for(let k in obj)
       {
            for(let j in r)
            {
                if(j == k){
                    r[j] = obj[k];
                    continue;
                }
            }
       }       
       
       return r;
    }
    

}

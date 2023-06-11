import Checkpoint from "../core/entities/Checkpoint";
import User from "../core/entities/User";


export class InsertCheckpointDTO 
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
        return new Checkpoint(user, this.X, this.Y, this.Picture);
    }

    public static MapToDTO(obj : any) : InsertCheckpointDTO
    {
       let r = Reflect.construct(InsertCheckpointDTO, []);

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

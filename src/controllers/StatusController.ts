
import { ControllerBase, Route, Action } from "web_api_base";


@Route()
export default class StatusController extends ControllerBase
{ 
     
    constructor()
    {
        super();              
    }
    
    @Action()
    public Ping() : void
    {       
        this.OK({status : "pong"});
    }
    
}
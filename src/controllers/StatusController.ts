
import { ControllerBase, Route, Action, ActionResult } from "web_api_base";


@Route()
export default class StatusController extends ControllerBase
{

    constructor()
    {
        super();
    }

    @Action()
    public Ping(): ActionResult
    {
        return this.OK({ status: "pong" });
    }

}
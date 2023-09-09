import { ControllerBase } from "web_api_base";

export default abstract class AbstractController extends ControllerBase {
    abstract SetClientDatabaseAsync(): Promise<void>;    

}

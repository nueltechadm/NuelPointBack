import { IHTTPRequestContext } from "web_api_base";

export default function DatabasesAuthFilter(context: IHTTPRequestContext) {
    let token = "HRG587T8R8D5V2H4K4L4#SJREHFD993HADRINAOSJAGDKGFLEUYYTSNAKKJA6D8F48AD";

    let authToken = context.Request.headers["api-secret-key"];

    if (!authToken || authToken != token) {
        context.Response.status(401);
        context.Response.json({ Message: "Access denied" });
    }
    else
        context.Next();
}

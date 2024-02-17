import { Application, IHTTPRequestContext } from "web_api_base";

export default async function DatabasesAuthFilter(context: IHTTPRequestContext) : Promise<void> 
{
    
    if(Application.Configurations.DEBUG)
        return await context.Next();

    let token = "HRG587T8R8D5V2H4K4L4#SJREHFD993HADRINAOSJAGDKGFLEUYYTSNAKKJA6D8F48AD";

    let authToken = context.Request.headers["api-secret-key"];

    if (!authToken || authToken != token) {
        context.Response.status(401);
        context.Response.json({ Message: "Access denied" });
    }
    else
        await context.Next();
}

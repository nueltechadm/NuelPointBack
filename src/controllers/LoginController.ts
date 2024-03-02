
import { POST, Inject, FromBody, RunBefore, GET, ActionResult, Description } from "web_api_base";
import AbstractUserService from "@contracts/AbstractUserService";
import { GenerateToken } from '@utils/JWT';
import { IsLogged } from "@filters/AuthFilter";
import Type from "@utils/Type";
import Authorization from "@utils/Authorization";
import AbstractController from "./AbstractController";
import AbstractDatabaseService from "@non-core-contracts/AbstractDatabaseService";
import LoginDTO from "../dto/LoginDTO";


export default class LoginController extends AbstractController
{
    @Inject()
    private _userService: AbstractUserService;

    @Inject()
    private _databaseService: AbstractDatabaseService;


    constructor(userService: AbstractUserService, databaseService: AbstractDatabaseService)
    {
        super();
        this._userService = userService;
        this._databaseService = databaseService;
    }


    @POST("login")
    @Description(`Utilize esse metodo para realizar login`)
    public async LoginAsync(@FromBody() user: LoginDTO): Promise<ActionResult>
    {
        let db = await this._databaseService.GetDabaseAsync(user.Link);

        if (!db)
            return this.BadRequest("Empresa não encontrada");

        if (!db.IsValid())
            return this.BadRequest({ Message: "Empresa não disponivel" });

        await this._userService.SetClientDatabaseAsync(new Authorization(user.Username, user.Link, -1).GetClientDatabase());

        let access = await this._userService.GetByUserNameAndPasswordAsync(user.Username, user.Password);

        if (!access)
            return this.BadRequest({ Message: "Usuário e/ou senha não incorretos" });

        delete (access as any).Password;

        if (!access.User)
            return this.BadRequest({ Message: "Acesso invalido, não existe usuário vinculado" });

        let token = GenerateToken(new Authorization(access.Username, user.Link, access.User.Id), 1);

        return this.OK({ User: Type.RemoveFieldsRecursive(access), Token: token });

    }



    @GET("validateToken")
    @Description(`Utilize esse metodo para válidar um Token`)
    @RunBefore(IsLogged)
    public async ValidateTokenAsync(): Promise<ActionResult>
    {
        return Promise.resolve(this.OK({ Message: "Token válido" }));
    }


}


import User from "@src/core/entities/User";



export default class UserDTO extends User {
    public CompanyId: number = 0;
    public JobRoleId: number = 0;
    public JourneyId: number = 0;

    public static Cast(userDTO: UserDTO): User {
        let instance = Reflect.construct(User, []);
        Object.assign(instance, userDTO);
        return instance;
    }
}


import DayOfWeekDTO from "./DayOfWeekDTO";


export default class JourneyDTO {
    Id: number = 0;
    Description: string = "";
    CompanyId: number = 0;    
    DaysOfWeek: DayOfWeekDTO[] = [new DayOfWeekDTO()];
}

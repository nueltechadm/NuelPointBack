import Journey from "@src/core/entities/Journey";
import DayOfWeekDTO from "./DayOfWeekDTO";


export default class JourneyDTO
{
    Id: number = 0;
    Description: string = "";
    CompanyId: number = 0;
    DaysOfWeek: DayOfWeekDTO[] = [new DayOfWeekDTO()];
    UsersIds: number[] = [];

    public static CastToDTO(journey: Journey): JourneyDTO
    {
        let dto = new JourneyDTO();

        if (journey.Company)
            dto.CompanyId = journey.Company.Id;

        dto.Description = journey.Description;
        dto.Id = journey.Id;

        if (journey.DaysOfWeek)
            dto.DaysOfWeek = journey.DaysOfWeek.map(s => DayOfWeekDTO.CastToDTO(s));

        return dto;
    }
}



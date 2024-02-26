import DayOfWeek, { Days } from "@src/core/entities/DayOfWeek";

export default class DayOfWeekDTO {

    public Id: number = -1;
    public Day: Days = Days.MONDAY;
    public DayName: string = "Monday";
    public TimeId: number = -1;
    public DayOff: boolean = false;

    public static Cast(dayOfWeek : DayOfWeek) : DayOfWeekDTO
    {
        let dto = new DayOfWeekDTO();

        dto.Day = dayOfWeek.Day;
        dto.DayName = dayOfWeek.DayName;
        dto.DayOff = dayOfWeek.DayOff;
        
        if(dayOfWeek.Time)
            dto.TimeId = dayOfWeek.Time.Id;

        dto.Id = dayOfWeek.Id;
        dto.DayName = dayOfWeek.DayName;
        
        return new DayOfWeekDTO();
    }
}

import { Days } from "@src/core/entities/DayOfWeek";

export default class DayOfWeekDTO {

    public Id: number = -1;
    public Day: Days = Days.MONDAY;
    public DayName: string = "Monday";
    public TimeId: number = -1;
    public DayOff: boolean = false;
}

import  Appointment  from "@entities/Appointment";
import User from "@entities/User";
import AbstractService, { PaginatedFilterRequest, PaginatedFilterResult } from "./AbstractService";


export default abstract class AbstractAppointmentService extends AbstractService<Appointment, PaginatedFilterRequest, PaginatedFilterResult<Appointment>>
{
    abstract GetByIdAsync(id: number): Promise<Appointment | undefined>;
    abstract GetCurrentDayByUser(user : User): Promise<Appointment | undefined>;
    abstract GetByUserAndDates(user : User, start : Date, end : Date): Promise<Appointment[]>;
}

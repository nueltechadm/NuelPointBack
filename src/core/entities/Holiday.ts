import { Table, Column, DataType, PrimaryKey, DBTypes, ManyToOne } from 'myorm_pg';
import Company from './Company';



@Table("holiday_tb")
export class Holiday {

    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id: number;

    @Column()
    public Active: boolean;

    @Column()
    @DataType(DBTypes.INTEGER)
    public Day: number;

    @Column()
    @DataType(DBTypes.INTEGER)
    public Month: number;

    @Column()
    public Description: string;

    @Column()
    @ManyToOne(() => Company)
    public Company: Company;

    constructor(description: string, company: Company, day : number, month : number) {
        this.Id = -1;
        this.Active = true;
        this.Day = day;
        this.Month = month;
        this.Description = description;
        this.Company = company;
    }

}

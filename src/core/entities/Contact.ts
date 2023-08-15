import { Table, Column, DBTypes, DataType, PrimaryKey } from 'myorm_pg';



@Table("contact_tb")
export default class Contact {

    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;
    
    @Column()
    public Contact: string;

    @Column()
    public Type: ContactType;

    public constructor(contact: string, type: ContactType) {

        this.Id = -1;
        this.Contact = contact;
        this.Type = type;
    }
}

export enum ContactType {
    PHONE = 1,
    EMAIL = 2
}

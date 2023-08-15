import { Table, Column, DBTypes, DataType, PrimaryKey } from 'myorm_pg';



@Table("address_tb")
export default class Address {

    @Column()
    @PrimaryKey()
    @DataType(DBTypes.SERIAL)
    public Id : number;

    @Column()
    public PublicArea: string;

    @Column()
    public Number: string;

    @Column()
    public Neighborhood: string;

    @Column()
    public Complement: string;

    @Column()
    public ZipCode: string;

    @Column()
    public City: string;

    @Column()
    public State: string;

    public constructor(publicArea: string, number: string, neighborhod: string, complement: string, zipcode: string, city: string, state: string) {
        this.Id = -1;
        this.PublicArea = publicArea;
        this.Number = number;
        this.Neighborhood = neighborhod;
        this.Complement = complement;
        this.ZipCode = zipcode;
        this.State = state;
        this.City = city;
    }
}

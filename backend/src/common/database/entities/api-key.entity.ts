import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text", {unique: true})
    key: string;

    @Column("text")
    owner: string;
}
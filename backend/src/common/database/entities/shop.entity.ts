import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Item} from "./item.entity";

@Entity()
export class Shop {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text", {unique: true})
    internalId: string;

    @Column("text")
    name: string;

    @OneToMany(() => Item, item => item.shop)
    items: Item[];
}
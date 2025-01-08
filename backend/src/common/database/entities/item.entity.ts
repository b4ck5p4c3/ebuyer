import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MONEY_DECIMAL_PLACES, MONEY_PRECISION} from "../../money";
import {DecimalTransformer} from "../transformers/decimal.transformer";
import Decimal from "decimal.js";
import {Shop} from "./shop.entity";

export enum ItemStatus {
    CREATED = "created",
    CANCELED = "canceled",
    FULFILLED = "fulfilled",
}

@Entity()
export class Item {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    title: string;

    @Column("text", {nullable: true})
    comment?: string;

    @Column("text", {nullable: true})
    sku?: string;

    @Column("text", {nullable: true})
    imageUrl?: string;

    @Column("text", {nullable: true})
    itemUrl?: string;

    @Column("decimal", {
        precision: MONEY_PRECISION,
        scale: MONEY_DECIMAL_PLACES,
        transformer: new DecimalTransformer(),
        nullable: true
    })
    price?: Decimal;

    @Column("integer")
    requiredCount: number;

    @Column("integer", {default: 0})
    boughtCount: number;

    @Column({type: "enum", enum: ItemStatus, default: ItemStatus.CREATED})
    status: ItemStatus;

    @Column({type: "jsonb", nullable: true})
    additionalData?: object;

    @ManyToOne(() => Shop, shop => shop.items)
    shop: Shop;

    @Column("text")
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;
}
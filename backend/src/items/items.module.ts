import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Item} from "../common/database/entities/item.entity";
import {ShopsModule} from "../shops/shops.module";
import {ItemsService} from "./items.service";
import {ItemsController} from "./items.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Item]), ShopsModule],
    providers: [ItemsService],
    controllers: [ItemsController]
})
export class ItemsModule {
}
import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {Item} from "./entities/item.entity";
import {Shop} from "./entities/shop.entity";
import {ApiKey} from "./entities/api-key.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                url: configService.getOrThrow("DATABASE_URL"),
                entities: [Item, Shop, ApiKey],
                synchronize: true,
                logging: process.env.NODE_ENV === "development"
            }),
            inject: [ConfigService]
        })
    ]
})
export class DatabaseModule {
}
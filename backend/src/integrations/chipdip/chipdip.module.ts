import {Module} from "@nestjs/common";
import {ChipdipService} from "./chipdip.service";
import {ChipdipController} from "./chipdip.controller";
import {HttpModule} from "@nestjs/axios";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [ChipdipService],
    controllers: [ChipdipController],
})
export class ChipdipModule {
}
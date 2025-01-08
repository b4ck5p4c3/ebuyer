import {Module} from "@nestjs/common";
import {HttpModule} from "@nestjs/axios";
import {KrepkomController} from "./krepkom.controller";
import {KrepkomService} from "./krepkom.service";

@Module({
    imports: [HttpModule],
    providers: [KrepkomService],
    controllers: [KrepkomController],
})
export class KrepkomModule {
}
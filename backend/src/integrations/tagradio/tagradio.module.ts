import {Module} from "@nestjs/common";
import {HttpModule} from "@nestjs/axios";
import {TagRadioController} from "./tagradio.controller";
import {TagRadioService} from "./tagradio.service";

@Module({
    imports: [HttpModule],
    providers: [TagRadioService],
    controllers: [TagRadioController],
})
export class TagRadioModule {
}
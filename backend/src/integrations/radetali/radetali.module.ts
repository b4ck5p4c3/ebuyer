import {Module} from "@nestjs/common";
import {RadetaliService} from "./radetali.service";
import {RadetaliController} from "./radetali.controller";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    providers: [RadetaliService],
    controllers: [RadetaliController],
})
export class RadetaliModule {
}
import {Module} from "@nestjs/common";
import {HttpModule} from "@nestjs/axios";
import {LeroyMerlinController} from "./leroy-merlin.controller";
import {LeroyMerlinService} from "./leroy-merlin.service";

@Module({
    imports: [HttpModule],
    providers: [LeroyMerlinService],
    controllers: [LeroyMerlinController],
})
export class LeroyMerlinModule {
}
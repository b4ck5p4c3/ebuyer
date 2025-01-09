import {Module} from "@nestjs/common";
import {ChipdipModule} from "./chipdip/chipdip.module";
import {RadetaliModule} from "./radetali/radetali.module";
import {KrepkomModule} from "./krepkom/krepkom.module";
import {LeroyMerlinModule} from "./leroy-merlin/leroy-merlin.module";

@Module({
    imports: [ChipdipModule, RadetaliModule, KrepkomModule, LeroyMerlinModule]
})
export class IntegrationsModule {
}
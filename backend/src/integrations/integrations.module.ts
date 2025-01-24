import {Module} from "@nestjs/common";
import {ChipdipModule} from "./chipdip/chipdip.module";
import {RadetaliModule} from "./radetali/radetali.module";
import {KrepkomModule} from "./krepkom/krepkom.module";
import {LeroyMerlinModule} from "./leroy-merlin/leroy-merlin.module";
import {TagRadioModule} from "./tagradio/tagradio.module";

@Module({
    imports: [
        ChipdipModule,
        RadetaliModule,
        KrepkomModule,
        LeroyMerlinModule,
        TagRadioModule
    ]
})
export class IntegrationsModule {
}
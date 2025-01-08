import {Module} from "@nestjs/common";
import {ChipdipModule} from "./chipdip/chipdip.module";
import {RadetaliModule} from "./radetali/radetali.module";
import {KrepkomModule} from "./krepkom/krepkom.module";

@Module({
    imports: [ChipdipModule, RadetaliModule, KrepkomModule]
})
export class IntegrationsModule {
}
import {Module} from "@nestjs/common";
import {ChipdipModule} from "./chipdip/chipdip.module";
import {RadetaliModule} from "./radetali/radetali.module";

@Module({
    imports: [ChipdipModule, RadetaliModule]
})
export class IntegrationsModule {
}
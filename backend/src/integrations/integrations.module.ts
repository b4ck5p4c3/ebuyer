import {Module} from "@nestjs/common";
import {ChipdipModule} from "./chipdip/chipdip.module";

@Module({
    imports: [ChipdipModule]
})
export class IntegrationsModule {
}
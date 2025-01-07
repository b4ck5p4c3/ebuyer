import {Module} from "@nestjs/common";
import {ShopsModule} from "../shops/shops.module";
import {SeederService} from "./seeder.service";

@Module({
    imports: [ShopsModule],
    providers: [SeederService]
})
export class SeederModule {
}
import {Module} from "@nestjs/common";
import {ApiKeysModule} from "./api-keys.module";
import {ApiKeysController} from "./api-keys.controller";
import {SessionStorageModule} from "../session-storage/session-storage.module";

@Module({
    imports: [ApiKeysModule, SessionStorageModule],
    controllers: [ApiKeysController],
})
export class ApiKeysControllerModule {}
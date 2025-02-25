import {Module} from "@nestjs/common";
import {LogtoAuthController} from "./logto-auth.controller";
import {LogtoAuthService} from "./logto-auth.service";
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "../auth/auth.module";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [ConfigModule, AuthModule,
        HttpModule],
    controllers: [LogtoAuthController],
    providers: [LogtoAuthService]
})
export class LogtoAuthModule {
}
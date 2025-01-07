import { Module } from '@nestjs/common';
import {AppConfigModule} from "./common/config/app-config.module";
import {AppHttpModule} from "./common/http/app-http.module";
import {DatabaseModule} from "./common/database/database.module";
import {LogtoAuthModule} from "./logto-auth/logto-auth.module";
import {ShopsModule} from "./shops/shops.module";
import {SeederModule} from "./seeder/seeder.module";
import {ItemsModule} from "./items/items.module";

@Module({
  imports: [
      AppConfigModule,
      AppHttpModule,

      DatabaseModule,

      ShopsModule,
      ItemsModule,
      SeederModule,

      LogtoAuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

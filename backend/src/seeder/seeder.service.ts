import {Injectable, OnModuleInit} from "@nestjs/common";
import {ShopsService} from "../shops/shops.service";

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(private shopsService: ShopsService) {
    }

    async onModuleInit(): Promise<void> {
        await this.tryCreateShop("chipdip", "Chip & Dip");
        await this.tryCreateShop("krepkom", "Krepkom");
        await this.tryCreateShop("leroy-merlin", "Lemana Pro");
        await this.tryCreateShop("radetali", "Radetali");
    }

    async tryCreateShop(internalId: string, name: string): Promise<void> {
        try {
            await this.shopsService.create({
                internalId,
                name
            });
        } catch (e) {
            // ignore
        }
    }
}
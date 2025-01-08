import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {promises as fsPromises} from "fs";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class ChipdipService {
    private readonly townId: string;

    constructor(private httpService: HttpService, private configService: ConfigService) {
        this.townId = configService.getOrThrow("CHIPDIP_TOWN_ID");
    }

    isChipdipProductUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            return (parsedUrl.hostname === "chipdip.ru" || parsedUrl.hostname === "www.chipdip.ru") &&
                !!parsedUrl.pathname.match(/^\/product(0?)\/([^\/]+?)$/);
        } catch (e) {
            return false;
        }
    }

    isChipdipSku(data: string): boolean {
        return !!data.match(/^([0-9]+)$/);
    }

    async parseChipdipData(data: string): Promise<ItemDetailsDTO> {
        data = data.trim();
        if (this.isChipdipProductUrl(data)) {
            return this.parseChipdipUrl(data);
        }
        if (this.isChipdipSku(data)) {
            return this.parseChipdipUrl(`https://chipdip.ru/product0/${data}`);
        }
        throw new CustomValidationError("Not a Chipdip URL or SKU");
    }

    async parseChipdipUrl(url: string): Promise<ItemDetailsDTO> {
        const content = (await this.httpService.axiosRef.get(url, {
            responseType: "text",
            headers: {
                cookie: `TownId=${this.townId}`
            }
        })).data as string;

        const fixedContent = content.replace(/[\n\r]/gi, " ");

        const title = (fixedContent.match(/<h1 itemprop="name">(.*?)<\/h1>/) ?? [])[1];
        if (!title) {
            throw new CustomValidationError("Failed to find item title");
        }

        const sku = (fixedContent.match(/<meta itemprop="productID" content="sku:(\d+?)">/) ?? [])[1];
        if (!sku) {
            throw new CustomValidationError("Failed to find item SKU");
        }

        const imageUrl = (fixedContent.match(/class="galery"><img src="(.*?)" class="product__image-preview item__image_medium"/) ?? [])[1];

        const price = (fixedContent.match(/<span class="price nw"><span class="price__value">(.*?)<\/span>/) ?? [])[1]
            ?.replaceAll("&#160;", "");

        return {
            title,
            sku,
            imageUrl,
            itemUrl: url,
            price
        }
    }
}
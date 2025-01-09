import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {ConfigService} from "@nestjs/config";
import {verifyUrl} from "../utils";
import {JSDOM} from "jsdom";

@Injectable()
export class ChipdipService {
    private readonly townId: string;

    constructor(private httpService: HttpService, private configService: ConfigService) {
        this.townId = configService.getOrThrow("CHIPDIP_TOWN_ID");
    }

    isChipdipProductUrl(url: string): boolean {
        return verifyUrl(url, /^((www\.)?)chipdip.ru$/, /^\/product(0?)\/([^\/]+?)$/);
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
        const response = await this.httpService.axiosRef.get(url, {
            responseType: "text",
            headers: {
                cookie: `TownId=${this.townId}`
            },
            validateStatus: () => true
        });

        if (response.status === 404) {
            throw new CustomValidationError("Item not found");
        }

        if (response.status !== 200) {
            throw new CustomValidationError(`Wrong status from Chipdip: ${response.status}/${response.statusText}`);
        }

        const dom = new JSDOM(response.data as string, {
            url
        });
        const document = dom.window.document;

        const title = document.querySelector('h1[itemprop="name"]')?.textContent;
        const sku = ((document.querySelector('meta[itemprop="productID"]') as HTMLMetaElement)?.content
            ?.split("sku:") ?? [])[1];
        const imageUrl = (document.querySelector('img.item__image_medium') as HTMLImageElement)?.src;
        const price = document.querySelector('span.nw > span.price__value')?.textContent
            ?.replaceAll("\u00a0", "");

        return {
            title,
            sku,
            imageUrl: imageUrl.includes("/noimage/") ? undefined : imageUrl,
            itemUrl: url,
            price
        }
    }
}
import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {verifyUrl} from "../utils";
import {JSDOM} from "jsdom";

@Injectable()
export class RadetaliService {
    constructor(private httpService: HttpService) {
    }

    isRadetaliProductUrl(url: string): boolean {
        return verifyUrl(url, /^((www\.)?)radetali.ru$/, /^\/catalog\/product\/([^\/]+?)\/$/);
    }

    async parseMaybeRadetaliUrl(data: string): Promise<ItemDetailsDTO> {
        data = data.trim();
        if (this.isRadetaliProductUrl(data)) {
            return this.parseRadetaliUrl(data);
        }
        throw new CustomValidationError("Not a Radetali URL");
    }

    async parseRadetaliUrl(url: string): Promise<ItemDetailsDTO> {
        const response = await this.httpService.axiosRef.get(url, {
            responseType: "text",
            validateStatus: () => true
        });

        if (response.status === 404) {
            throw new CustomValidationError("Item not found");
        }

        if (response.status !== 200) {
            throw new CustomValidationError(`Wrong status from Radetali: ${response.status}/${response.statusText}`);
        }

        const dom = new JSDOM(response.data as string, {
            url
        });
        const document = dom.window.document;

        const title = (document.querySelector('h1')?.childNodes ?? [])[0]?.textContent?.trim();
        const sku = document.querySelector('b.product-cart-articul')?.textContent;
        const imageUrl = (document.querySelector('img[itemprop="thumbnail"]') as HTMLImageElement)?.src;
        const price = (document.querySelector('b.price') as HTMLSpanElement)?.textContent
            ?.replaceAll(' ', '');

        return {
            title,
            sku,
            imageUrl,
            itemUrl: url,
            price
        }
    }
}
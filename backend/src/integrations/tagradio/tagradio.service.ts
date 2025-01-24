import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {verifyUrl} from "../utils";
import {JSDOM} from "jsdom";

@Injectable()
export class TagRadioService {
    constructor(private httpService: HttpService) {
    }

    isTagRadioProductUrl(url: string): boolean {
        return verifyUrl(url, /^((www\.)?)taggsm.ru$/, /^\/index\.php$/);
    }

    async parseMaybeTagRadioUrl(data: string): Promise<ItemDetailsDTO> {
        data = data.trim();
        if (this.isTagRadioProductUrl(data)) {
            return this.parseTagRadioUrl(data);
        }
        throw new CustomValidationError("Not a Radetali URL");
    }

    async parseTagRadioUrl(url: string): Promise<ItemDetailsDTO> {
        const response = await this.httpService.axiosRef.get(url, {
            responseType: "text",
            validateStatus: () => true
        });

        if (response.status === 404) {
            throw new CustomValidationError("Item not found");
        }

        if (response.status !== 200) {
            throw new CustomValidationError(`Wrong status from TAGRADIO: ${response.status}/${response.statusText}`);
        }

        const dom = new JSDOM(response.data as string, {
            url
        });
        const document = dom.window.document;

        const title = (document.querySelector('meta[itemprop="name"]') as HTMLMetaElement)?.content;
        const sku = ((document.querySelector('meta[itemprop="productID"]') as HTMLMetaElement)?.content?.split("sku:") ?? [])[1];
        const imageUrl = (document.querySelector('meta[itemprop="image"]') as HTMLMetaElement)?.content;
        const price = (document.querySelector('meta[itemprop="price"]') as HTMLMetaElement)?.content;

        return {
            title,
            sku,
            imageUrl,
            itemUrl: url,
            price
        }
    }
}
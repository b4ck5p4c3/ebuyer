import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {Agent as HttpsAgent} from "https";

@Injectable()
export class KrepkomService {
    constructor(private httpService: HttpService) {
    }

    isKrepkomProductUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            return (parsedUrl.hostname === "krepcom.ru" || parsedUrl.hostname === "www.krepcom.ru") &&
                !!parsedUrl.pathname.match(/^\/catalog\/([^\/]+?)\/([^\/]+?).htm$/);
        } catch (e) {
            return false;
        }
    }

    async parseMaybeKrepkomUrl(data: string): Promise<ItemDetailsDTO> {
        data = data.trim();
        if (this.isKrepkomProductUrl(data)) {
            return this.parseKrepkomUrl(data);
        }
        throw new CustomValidationError("Not a Krepkom URL");
    }

    async parseKrepkomUrl(url: string): Promise<ItemDetailsDTO> {
        const originalUrl = url;
        url = url.replace(/((www\.)?)krepcom.ru/, "86.110.215.73")
        const response = await this.httpService.axiosRef.get(url, {
            responseType: "text",
            validateStatus: () => true,
            headers: {
                "host": "krepcom.ru"
            },
            httpsAgent: new HttpsAgent({
                rejectUnauthorized: false
            })
        });

        if (response.status === 404) {
            throw new CustomValidationError("Item not found");
        }

        if (response.status !== 200) {
            throw new CustomValidationError(`Wrong status from Krepkom: ${response.status}/${response.statusText}`);
        }

        const content = response.data as string;

        const fixedContent = content.replace(/[\n\r]/gi, " ");

        const sku = (fixedContent.match(/<span>Код товара: (.*?) <\/span>/) ?? [])[1];

        const allJsonMatches = fixedContent.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g);

        for (const match of allJsonMatches) {
            const data = JSON.parse(match[0].match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
            if (data["@type"] === "Product") {
                return {
                    title: data.name ? String(data.name) : undefined,
                    sku,
                    imageUrl: data.image ? `https:${String(data.image)}` : undefined,
                    itemUrl: originalUrl,
                    price: data.offers?.price ? String(data.offers?.price) : undefined
                }
            }
        }

        return {
            itemUrl: originalUrl
        };
    }
}
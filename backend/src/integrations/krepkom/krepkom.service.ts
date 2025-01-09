import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {Agent as HttpsAgent} from "https";
import {verifyUrl} from "../utils";
import {JSDOM} from "jsdom";
import {parseItemDetailsFromLDJSONElements} from "../ldjson";

@Injectable()
export class KrepkomService {
    constructor(private httpService: HttpService) {
    }

    isKrepkomProductUrl(url: string): boolean {
        return verifyUrl(url, /^((www\.)?)krepcom.ru$/, /^\/catalog\/([^\/]+?)\/([^\/]+?).htm$/);
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

        const dom = new JSDOM(response.data as string, {
            url: originalUrl
        });
        const document = dom.window.document;

        const sku = (document.querySelector("div.top-line__id > span")?.textContent
            ?.split("Код товара: ") ?? [])[1]?.trim();
        const details = parseItemDetailsFromLDJSONElements(document);

        return {
            ...details,
            sku,
            itemUrl: originalUrl
        };
    }
}
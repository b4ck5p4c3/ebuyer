import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";
import {Agent as HttpsAgent} from "https";
import {verifyUrl} from "../utils";
import {JSDOM} from "jsdom";
import {parseItemDetailsFromLDJSONElements} from "../ldjson";

@Injectable()
export class LeroyMerlinService {
    constructor(private httpService: HttpService) {
    }

    isLemanaProProductUrl(url: string): boolean {
        return verifyUrl(url, /^((www\.)?)lemanapro.ru$/, /^\/product\/([^\/]+?)-(\d+)\/$/);
    }

    async parseMaybeLeroyMerlinUrl(data: string): Promise<ItemDetailsDTO> {
        data = data.trim();
        if (this.isLemanaProProductUrl(data)) {
            return this.parseLeroyMerlinUrl(data);
        }
        throw new CustomValidationError("Not a Lemana Pro URL");
    }

    async parseLeroyMerlinUrl(url: string): Promise<ItemDetailsDTO> {
        const response = await this.httpService.axiosRef.get(url, {
            responseType: "text",
            validateStatus: () => true
        });

        if (response.status === 404) {
            throw new CustomValidationError("Item not found");
        }

        if (response.status !== 200) {
            throw new CustomValidationError(`Wrong status from Leroy Merlin: ${response.status}/${response.statusText}`);
        }

        const dom = new JSDOM(response.data as string, {
            url
        });
        const document = dom.window.document;

        const details = parseItemDetailsFromLDJSONElements(document);

        return {
            ...details,
            itemUrl: url
        };
    }
}
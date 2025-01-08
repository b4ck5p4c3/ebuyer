import {Injectable} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {CustomValidationError} from "../../common/exceptions";
import {HttpService} from "@nestjs/axios";

@Injectable()
export class RadetaliService {
    constructor(private httpService: HttpService) {
    }

    isRadetaliProductUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            return (parsedUrl.hostname === "radetali.ru" || parsedUrl.hostname === "www.radetali.ru") &&
                !!parsedUrl.pathname.match(/^\/catalog\/product\/([^\/]+?)\/$/);
        } catch (e) {
            return false;
        }
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

        const content = response.data as string;

        const fixedContent = content.replace(/[\n\r]/gi, " ");

        const title = (fixedContent.match(/<h1>(.*?) <div/) ?? [])[1];
        if (!title) {
            throw new CustomValidationError("Failed to find item title");
        }

        const sku = (fixedContent.match(/<b itemprop="value" class="product-cart-articul">(\d+)<\/b>/) ?? [])[1];
        if (!sku) {
            throw new CustomValidationError("Failed to find item SKU");
        }

        const imageUrl = (fixedContent.match(/<\/div>(\s*?)<img src="(.*?)" alt="(.*?)" itemprop="thumbnail" id="product_img_/) ?? [])[2];

        const price = (fixedContent.match(/<b class="price">(.*?)<\/b>/) ?? [])[1];

        return {
            title,
            sku,
            imageUrl: imageUrl ? `https://www.radetali.ru${imageUrl}` : undefined,
            itemUrl: url,
            price
        }
    }
}
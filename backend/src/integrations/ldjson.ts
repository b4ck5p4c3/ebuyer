import {ItemDetailsDTO} from "./types";
import {Product, WithContext} from "schema-dts";

function toAbsoluteUrl(url: string): string {
    if (url.startsWith("//")) {
        return `https:${url}`;
    }
    return url;
}

export function parseItemDetailsFromLDJSONElements(document: Document): ItemDetailsDTO {
    for (const element of document.querySelectorAll('script[type="application/ld+json"]')) {
        const data = element.textContent;
        try {
            const parsedData = JSON.parse(data) as WithContext<Product>;
            if (parsedData["@type"] !== "Product") {
                continue;
            }

            // we're fucked, we're totally fucked
            return {
                title: typeof parsedData.name === "string" ? parsedData.name : undefined,
                imageUrl: toAbsoluteUrl(Array.isArray(parsedData.image) ? (typeof parsedData.image[0] === "string" ?
                    parsedData.image[0] : undefined) : (typeof parsedData.image === "string" ?
                    parsedData.image : undefined)),
                sku: typeof parsedData.sku === "string" ? parsedData.sku : undefined,
                price: "@type" in parsedData.offers && parsedData.offers["@type"] === "Offer" ?
                    typeof parsedData.offers.price === "string" ? parsedData.offers.price : undefined : undefined
            }
        } catch (e) {
        }
    }
    return {};
}
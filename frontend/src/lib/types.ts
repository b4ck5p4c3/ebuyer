export interface DefaultDialogProps {
    open: boolean;
    onClose: () => void;
}

export interface ShopDTO {
    id: string;
    internalId: string;
    name: string;
}

export interface ItemDTO {
    id: string;
    title: string;
    comment?: string;
    sku?: string;
    imageUrl?: string;
    itemUrl?: string;
    price?: string;
    requiredCount: number;
    boughtCount: number;
    status: "created" | "canceled" | "fulfilled";
    additionalData?: object;
}

export interface ItemDetailsDTO {
    title?: string;
    comment?: string;
    sku?: string;
    imageUrl?: string;
    itemUrl?: string;
    price?: string;
}
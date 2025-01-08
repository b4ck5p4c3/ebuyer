import {
    ApiBody,
    ApiCookieAuth,
    ApiDefaultResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiTags
} from "@nestjs/swagger";
import {Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post} from "@nestjs/common";
import {ItemsService} from "./items.service";
import {ErrorApiResponse} from "../common/api-responses";
import {Item, ItemStatus} from "../common/database/entities/item.entity";
import {MONEY_PRECISION} from "../common/money";
import {UserId} from "../auth/user-id.decorator";
import {IsNotEmpty, IsNumberString, IsOptional, IsUrl, IsUUID} from "class-validator";
import {ShopsService} from "../shops/shops.service";
import {Errors} from "../common/errors";
import {CustomValidationError} from "../common/exceptions";
import Decimal from "decimal.js";

class ItemDTO {
    @ApiProperty({format: "uuid"})
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty({required: false})
    comment?: string;

    @ApiProperty({required: false})
    sku?: string;

    @ApiProperty({required: false})
    imageUrl?: string;

    @ApiProperty({required: false})
    itemUrl?: string;

    @ApiProperty({required: false})
    price?: string;

    @ApiProperty()
    requiredCount: number;

    @ApiProperty()
    boughtCount: number;

    @ApiProperty({enum: ItemStatus})
    status: ItemStatus;

    @ApiProperty({required: false})
    additionalData?: object;
}

class CreateItemDTO {
    @ApiProperty()
    @IsNotEmpty()
    shopInternalId: string;

    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty({required: false})
    @IsOptional()
    comment?: string;

    @ApiProperty({required: false})
    @IsOptional()
    sku?: string;

    @ApiProperty({required: false})
    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty({required: false})
    @IsUrl()
    @IsOptional()
    itemUrl?: string;

    @ApiProperty({required: false})
    @IsNumberString()
    @IsOptional()
    price?: string;

    @ApiProperty()
    @IsNotEmpty()
    requiredCount: number;

    @ApiProperty({required: false})
    @IsOptional()
    additionalData?: object;
}

export class BuyItemDTO {
    @ApiProperty()
    @IsNotEmpty()
    additionalBoughtCount: number;
}

@ApiTags("items")
@Controller("items")
export class ItemsController {
    constructor(private itemsService: ItemsService, private shopsService: ShopsService) {
    }

    static mapToDTO(item: Item): ItemDTO {
        return {
            id: item.id,
            title: item.title,
            comment: item.comment || undefined,
            sku: item.sku || undefined,
            imageUrl: item.imageUrl || undefined,
            itemUrl: item.itemUrl || undefined,
            price: item.price?.toFixed(MONEY_PRECISION) || undefined,
            requiredCount: item.requiredCount,
            boughtCount: item.boughtCount,
            status: item.status,
            additionalData: item.additionalData || undefined,
        };
    }

    @Get("shop/:shopInternalId")
    @ApiOperation({
        summary: "Get all unfulfilled items by shop"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: [ItemDTO]
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async findAllUnfulfilledByShop(@Param("shopInternalId") shopInternalId: string): Promise<ItemDTO[]> {
        return (await this.itemsService.findAllUnfulfilledByShopInternalId(shopInternalId)).map(ItemsController.mapToDTO);
    }

    @Post()
    @ApiOperation({
        summary: "Create item"
    })
    @ApiBody({
        type: CreateItemDTO
    })
    @ApiOkResponse({
        description: "Successful response",
        type: ItemDTO
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async create(@UserId() actorId: string, @Body() request: CreateItemDTO): Promise<ItemDTO> {
        if (request.requiredCount <= 0) {
            throw new CustomValidationError("Required count should be greater than zero");
        }
        request.requiredCount = Math.floor(request.requiredCount);
        const shop = await this.shopsService.findByInternalId(request.shopInternalId);
        if (!shop) {
            throw new HttpException(Errors.SHOP_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        const item = await this.itemsService.create({
            title: request.title,
            comment: request.comment,
            sku: request.sku,
            imageUrl: request.imageUrl,
            itemUrl: request.itemUrl,
            price: request.price ? new Decimal(request.price) : undefined,
            requiredCount: request.requiredCount,
            additionalData: request.additionalData,
            shop,
            createdBy: actorId
        });

        return ItemsController.mapToDTO(item);
    }

    @Patch(":itemId/buy")
    @ApiOperation({
        summary: "Update item bought counter"
    })
    @ApiBody({
        type: BuyItemDTO
    })
    @ApiOkResponse({
        description: "Successful response",
        type: ItemDTO
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async buyItem(@Param("itemId") itemId: string, @Body() request: BuyItemDTO): Promise<ItemDTO> {
        const newItem = await this.itemsService.transaction(async manager => {
            const item = await this.itemsService.for(manager).findByIdLocked(itemId);
            if (!item) {
                throw new HttpException(Errors.ITEM_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            if (item.status !== ItemStatus.CREATED) {
                throw new CustomValidationError("Item already fulfilled");
            }

            item.boughtCount += request.additionalBoughtCount;
            if (item.boughtCount >= item.requiredCount) {
                item.status = ItemStatus.FULFILLED;
            }
            await this.itemsService.for(manager).update(item);
            return item;
        });

        return ItemsController.mapToDTO(newItem);
    }


    @Patch(":itemId/cancel")
    @ApiOperation({
        summary: "Cancel item"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: ItemDTO
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async cancelItem(@Param("itemId") itemId: string): Promise<ItemDTO> {
        const newItem = await this.itemsService.transaction(async manager => {
            const item = await this.itemsService.for(manager).findByIdLocked(itemId);
            if (!item) {
                throw new HttpException(Errors.ITEM_NOT_FOUND, HttpStatus.NOT_FOUND);
            }

            if (item.status !== ItemStatus.CREATED) {
                throw new CustomValidationError("Item already fulfilled");
            }

            item.status = ItemStatus.CANCELED;
            await this.itemsService.for(manager).update(item);
            return item;
        });

        return ItemsController.mapToDTO(newItem);
    }
}
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
import {IsNotEmpty, IsNumberString, IsUrl, IsUUID} from "class-validator";
import {ShopsService} from "../shops/shops.service";
import {Errors} from "../common/errors";
import {CustomValidationError} from "../common/exceptions";

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
    @ApiProperty({format: "uuid"})
    @IsUUID()
    @IsNotEmpty()
    shopId: string;

    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty({required: false})
    comment?: string;

    @ApiProperty({required: false})
    sku?: string;

    @ApiProperty({required: false})
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({required: false})
    @IsUrl()
    itemUrl?: string;

    @ApiProperty({required: false})
    @IsNumberString()
    price?: string;

    @ApiProperty()
    @IsNotEmpty()
    requiredCount: number;

    @ApiProperty({required: false})
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
            comment: item.comment,
            sku: item.sku,
            imageUrl: item.imageUrl,
            itemUrl: item.itemUrl,
            price: item.price?.toFixed(MONEY_PRECISION),
            requiredCount: item.requiredCount,
            boughtCount: item.boughtCount,
            status: item.status,
            additionalData: item.additionalData,
        };
    }

    @Get("shop/:shopId")
    @ApiOperation({
        description: "Get all unfulfilled items by shop"
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
    async findAllUnfulfilledByShop(@Param("shopId") shopId: string): Promise<ItemDTO[]> {
        return (await this.itemsService.findAllUnfulfilledByShop(shopId)).map(ItemsController.mapToDTO);
    }

    @Post()
    @ApiOperation({
        description: "Create item"
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
        const shop = await this.shopsService.findById(request.shopId);
        if (!shop) {
            throw new HttpException(Errors.SHOP_NOT_FOUND, HttpStatus.NOT_FOUND);
        }

        const item = await this.itemsService.create({
            title: request.title,
            comment: request.comment,
            sku: request.sku,
            imageUrl: request.imageUrl,
            itemUrl: request.itemUrl,
            price: request.price,
            requiredCount: request.requiredCount,
            additionalData: request.additionalData,
            shop,
            createdBy: actorId
        });

        return ItemsController.mapToDTO(item);
    }

    @Patch(":itemId/buy")
    @ApiOperation({
        description: "Update item bought counter"
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
            await this.itemsService.update(item);
            return item;
        });

        return ItemsController.mapToDTO(newItem);
    }


    @Patch(":itemId/cancel")
    @ApiOperation({
        description: "Cancel item"
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
            await this.itemsService.update(item);
            return item;
        });

        return ItemsController.mapToDTO(newItem);
    }
}
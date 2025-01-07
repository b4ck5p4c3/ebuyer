import {Controller, Get} from "@nestjs/common";
import {ApiCookieAuth, ApiDefaultResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags} from "@nestjs/swagger";
import {ShopsService} from "./shops.service";
import {ErrorApiResponse} from "../common/api-responses";
import {Shop} from "../common/database/entities/shop.entity";

class ShopDTO {
    @ApiProperty({format: "uuid"})
    id: string;

    @ApiProperty()
    internalId: string;

    @ApiProperty()
    name: string;
}

@ApiTags("shops")
@Controller("shops")
export class ShopsController {
    constructor(private shopsService: ShopsService) {
    }

    static mapToDTO(shop: Shop): ShopDTO {
        return {
            id: shop.id,
            internalId: shop.internalId,
            name: shop.name
        };
    }

    @Get()
    @ApiOperation({
        summary: "Get all shops"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: [ShopDTO]
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async findAll(): Promise<ShopDTO[]> {
        return (await this.shopsService.findAll()).map(ShopsController.mapToDTO);
    }
}
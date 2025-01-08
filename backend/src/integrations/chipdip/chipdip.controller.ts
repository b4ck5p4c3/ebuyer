import {Body, Controller, Post} from "@nestjs/common";
import {ItemDetailsDTO} from "../types";
import {
    ApiBody,
    ApiCookieAuth,
    ApiDefaultResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiTags
} from "@nestjs/swagger";
import {ErrorApiResponse} from "../../common/api-responses";
import {ChipdipService} from "./chipdip.service";

export class ParseChipdipDTO {
    @ApiProperty()
    data: string;
}

@Controller("/integrations/chipdip")
@ApiTags("integrations/chipdip")
export class ChipdipController {

    constructor(private chipdipService: ChipdipService) {
    }

    @Post("parse")
    @ApiOperation({
        summary: "Parse chipdip URL/SKU"
    })
    @ApiBody({
        type: ParseChipdipDTO
    })
    @ApiOkResponse({
        description: "Successful response",
        type: ItemDetailsDTO
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async parse(@Body() request: ParseChipdipDTO): Promise<ItemDetailsDTO> {
        return await this.chipdipService.parseChipdipData(request.data);
    }
}
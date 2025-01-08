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
import {IsUrl} from "class-validator";
import {KrepkomService} from "./krepkom.service";

export class ParseKrepkomDTO {
    @ApiProperty()
    @IsUrl()
    url: string;
}

@Controller("/integrations/krepkom")
@ApiTags("integrations/krepkom")
export class KrepkomController {

    constructor(private krepkomService: KrepkomService) {
    }

    @Post("parse")
    @ApiOperation({
        summary: "Parse Krepkom URL"
    })
    @ApiBody({
        type: ParseKrepkomDTO
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
    async parse(@Body() request: ParseKrepkomDTO): Promise<ItemDetailsDTO> {
        return await this.krepkomService.parseMaybeKrepkomUrl(request.url);
    }
}
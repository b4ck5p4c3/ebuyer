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
import {RadetaliService} from "./radetali.service";
import {IsUrl} from "class-validator";

export class ParseRadetaliDTO {
    @ApiProperty()
    @IsUrl()
    url: string;
}

@Controller("/integrations/radetali")
@ApiTags("integrations/radetali")
export class RadetaliController {

    constructor(private radetaliService: RadetaliService) {
    }

    @Post("parse")
    @ApiOperation({
        summary: "Parse Radetali URL"
    })
    @ApiBody({
        type: ParseRadetaliDTO
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
    async parse(@Body() request: ParseRadetaliDTO): Promise<ItemDetailsDTO> {
        return await this.radetaliService.parseMaybeRadetaliUrl(request.url);
    }
}
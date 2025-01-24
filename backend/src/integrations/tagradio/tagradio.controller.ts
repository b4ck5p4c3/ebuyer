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
import {TagRadioService} from "./tagradio.service";
import {IsUrl} from "class-validator";

export class ParseTagRadioDTO {
    @ApiProperty()
    @IsUrl()
    url: string;
}

@Controller("/integrations/tagradio")
@ApiTags("integrations/tagradio")
export class TagRadioController {

    constructor(private tagRadioService: TagRadioService) {
    }

    @Post("parse")
    @ApiOperation({
        summary: "Parse TAGRADIO URL"
    })
    @ApiBody({
        type: ParseTagRadioDTO
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
    async parse(@Body() request: ParseTagRadioDTO): Promise<ItemDetailsDTO> {
        return await this.tagRadioService.parseMaybeTagRadioUrl(request.url);
    }
}
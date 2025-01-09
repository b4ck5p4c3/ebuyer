import {Body, Controller, HttpException, HttpStatus, Post} from "@nestjs/common";
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
import {LeroyMerlinService} from "./leroy-merlin.service";
import {Errors} from "../../common/errors";

export class ParseLeroyMerlinDTO {
    @ApiProperty()
    @IsUrl()
    url: string;
}

@Controller("/integrations/leroy-merlin")
@ApiTags("integrations/leroy-merlin")
export class LeroyMerlinController {

    constructor(private leroyMerlinService: LeroyMerlinService) {
    }

    @Post("parse")
    @ApiOperation({
        summary: "Parse Leroy Merlin (nowadays Lemana Pro) URL"
    })
    @ApiBody({
        type: ParseLeroyMerlinDTO
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
    async parse(@Body() request: ParseLeroyMerlinDTO): Promise<ItemDetailsDTO> {
        throw new HttpException(Errors.API_NOT_IMPLEMENTED, HttpStatus.INTERNAL_SERVER_ERROR);
        // return await this.leroyMerlinService.parseMaybeLeroyMerlinUrl(request.url);
    }
}
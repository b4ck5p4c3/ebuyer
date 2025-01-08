import {Controller, Delete, Get, HttpException, HttpStatus, Param, Post} from "@nestjs/common";
import {ApiKeysService} from "./api-keys.service";
import {ApiCookieAuth, ApiDefaultResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags} from "@nestjs/swagger";
import {UserId} from "../auth/user-id.decorator";
import {EmptyResponse} from "../common/utils";
import {ApiKey} from "../common/database/entities/api-key.entity";
import {randomBytes} from "crypto";
import {ErrorApiResponse} from "../common/api-responses";
import {SessionStorageService} from "../session-storage/session-storage.service";
import {Errors} from "../common/errors";

class ApiKeyDTO {
    @ApiProperty({format:"uuid"})
    id: string;

    @ApiProperty()
    key: string;
}

@Controller("api-keys")
@ApiTags("api-keys")
export class ApiKeysController {
    constructor(private apiKeysService: ApiKeysService, private sessionStorageService: SessionStorageService) {
    }

    private static mapToDTO(apiKey: ApiKey): ApiKeyDTO {
        return {
            id: apiKey.id,
            key: apiKey.key
        };
    }

    @Get()
    @ApiOperation({
        summary: "Get your API keys"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: [ApiKeyDTO]
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async findMy(@UserId() actorId: string): Promise<ApiKeyDTO[]> {
        return (await this.apiKeysService.findByOwner(actorId)).map(key => ApiKeysController.mapToDTO(key));
    }

    @Post()
    @ApiOperation({
        summary: "Create new API key"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: ApiKeyDTO
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async create(@UserId() actorId: string): Promise<ApiKeyDTO> {
        const key = `swynca${randomBytes(32).toString("hex")}0b08`;
        return ApiKeysController.mapToDTO(await this.apiKeysService.transaction(async manager => {
            const apiKey = await this.apiKeysService.for(manager).create({
                key,
                owner: actorId
            });
            await this.sessionStorageService.add(key, actorId);
            return apiKey;
        }));
    }

    @Delete(":id")
    @ApiOperation({
        summary: "Delete API key"
    })
    @ApiOkResponse({
        description: "Successful response",
        type: EmptyResponse
    })
    @ApiCookieAuth()
    @ApiDefaultResponse({
        description: "Erroneous response",
        type: ErrorApiResponse
    })
    async remove(@Param("id") id: string): Promise<EmptyResponse> {
        const apiKey = await this.apiKeysService.findById(id);
        if (!apiKey) {
            throw new HttpException(Errors.API_KEY_NOT_FOUND, HttpStatus.NOT_FOUND)
        }
        await this.apiKeysService.transaction(async manager => {
            await this.apiKeysService.for(manager).remove(id);
            await this.sessionStorageService.revokeToken(apiKey.key);
        });
        return {};
    }
}
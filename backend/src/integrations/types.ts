import {ApiProperty} from "@nestjs/swagger";

export class ItemDetailsDTO {
    @ApiProperty({required: false})
    title?: string;

    @ApiProperty({required: false})
    sku?: string;

    @ApiProperty({required: false})
    imageUrl?: string;

    @ApiProperty({required: false})
    itemUrl?: string;

    @ApiProperty({required: false})
    price?: string;
}
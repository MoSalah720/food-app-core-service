import { Type } from "class-transformer";
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MinLength
} from "class-validator";
import { addressTypes } from "../enums";

export class CreateAddressDTO {

    @IsString()
    @MinLength(1)
    label!: string;

    @IsString()
    @MinLength(1)
    country!: string;

    @IsString()
    @MinLength(1)
    city!: string;

    @IsString()
    @MinLength(1)
    street!: string;

    @IsString()
    @IsOptional()
    building?: string;

    @IsString()
    @IsOptional()
    apartmentNumber?: string;

    @IsEnum(addressTypes)
    type!: addressTypes;

    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;

    @IsBoolean()
    isDefault!: boolean;
}

export class UpdateAddressDTO {

    @IsOptional()
    @IsString()
   @MinLength(1)
    label?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    country?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    city?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    street?: string;

    @IsOptional()
    @IsString()
    building?: string;

    @IsOptional()
    @IsString()
    apartmentNumber?: string;

    @IsOptional()
    @IsEnum(addressTypes)
    type?: addressTypes;

    @IsOptional()
    @IsNumber()
    lat?: number;

    @IsOptional()
    @IsNumber()
    lng?: number;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
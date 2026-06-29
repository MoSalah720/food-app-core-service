import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { currency } from "../enums";

export class CreateBranchDTO{
    
    @IsString()
    @IsNotEmpty()
    countryCode!: string;

    @IsString()
    @IsNotEmpty()
    addressText!: string;

    @IsString()
    @IsNotEmpty()
    label!: string;

    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;

    @IsString()
    opensAt!: string;

    @IsString()
    closesAt!: string;

    @IsNumber()
    @Min(0)
    deliveryRadius!: number;

    @IsEnum(currency)
    currency!: currency;
}

export class UpdateBranchDTO{
     @IsString()
    @IsOptional()
    countryCode?: string;

    @IsString()
    @IsOptional()
    addressText?: string;

    @IsString()
    @IsOptional()
    label?: string;

    @IsNumber()
    @IsOptional()
    lat?: number;

    @IsNumber()
    @IsOptional()
    lng?: number;

    @IsString()
    @IsOptional()
    opensAt?: string;

    @IsString()
    @IsOptional()
    closesAt?: string;

    @IsNumber()
    @IsOptional()
    deliveryRadius?: number;

    @IsOptional()
    @IsBoolean()
    acceptOrders?:boolean

    @IsOptional()
    @IsEnum(currency)
    currency?: currency;
}

export class UpdateBranchStatusDTO{
    @IsOptional()
    @IsBoolean()
    isActive?: boolean

    @IsOptional()
    @IsNumber()
    commission?: number
}
import { Type } from "class-transformer";
import { IsEmail, MinLength, MaxLength, IsString, IsStrongPassword, IsOptional, ValidateNested, IsEnum } from "class-validator";
import { SystemRole } from "../../user/enums";
import { RestaurantStatus } from "../enums";

export class CreateRestaurantOwnerDTO{
    @IsEmail()
    email!: string;
    
    @MinLength(10)
    @MaxLength(11)
    phone!: string;
    
    @IsString()
    @MinLength(1)
    name!: string;
    
    @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    
    }, {
         message: 'Password is not strong enough. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number.',
    })
    password!: string;

    
}

export class CreateRestaurantDTO{
    @IsString()
    @MinLength(1)
    name!:string;
    
    @IsOptional()
    @IsString()
    logoURL?:string;
    
    @IsString()
    @MinLength(1)
    primaryCountry!:string

    @ValidateNested()
    @Type(()=>CreateRestaurantOwnerDTO)
    owner!: CreateRestaurantOwnerDTO
}

export class UpdateRestaurantDTO{
    @IsString()
     @IsOptional()
    name?:string;
    
    @IsOptional()
    @IsString()
    logoURL?:string;
    
    @IsString()
    @IsOptional()
    primaryCountry?:string
}

export class UpdateRestaurantStatusDTO{
    @IsEnum(RestaurantStatus)
    status!:RestaurantStatus
}
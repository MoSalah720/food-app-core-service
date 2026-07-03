import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDTO{
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageURL?: string;

    @IsOptional()
    @IsString()
    categoryName?: string;

}
export class UpdateProductDTO{
    @IsString()
    @IsOptional()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageURL?: string;

    @IsOptional()
    @IsString()
    categoryName?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;
}
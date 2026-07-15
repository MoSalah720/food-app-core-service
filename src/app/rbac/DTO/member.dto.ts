import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMemberDTO{
    @IsString()
    @IsNotEmpty()
    email!: string;

     @IsString()
    @IsNotEmpty()
    name!: string;

     @IsString()
    @IsNotEmpty()
    phoneNumber!: string;

     @IsString()
    @IsNotEmpty()
    role!: string;

    @IsArray()
    @IsOptional()
    branchIds!: number[];
}

export class UpdateMemberDTO{
    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    @IsIn(['active','inactive', 'suspended'])
    status?: string;
}

export class UpdateMemberBranchesDTO{
    @IsArray()
    branchIds!:number[];
}
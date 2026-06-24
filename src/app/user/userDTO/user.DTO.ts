import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDTO{
  @IsNotEmpty()
  @IsString()
  name!: string;

  @MinLength(10)  
  @MaxLength(11)
  phone!: string;
}
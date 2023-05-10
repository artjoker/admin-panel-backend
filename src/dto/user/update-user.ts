import {
  Length,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsString,
  NotContains,
} from 'class-validator';

class UpdateUserDTO {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Length(4, 100)
  @NotContains(' ')
  password?: string;
}

export default UpdateUserDTO;

import { UserRole } from '../../entities/role';
import {
  Length,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  NotContains,
} from 'class-validator';

class CreateUserDTO {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEmail()
  email: string;

  @Length(4, 100)
  @NotContains(' ')
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  isActive: boolean;
}

export default CreateUserDTO;

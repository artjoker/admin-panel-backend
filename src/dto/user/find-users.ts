import {
  Length,
  ValidateNested,
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

enum SortValue {
  ASC = 'ASC',
  DESC = 'DESC',
}

class FiltersDTO {
  @IsOptional()
  @Length(4, 20)
  firstName?: string;

  @IsOptional()
  @Length(4, 20)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class SortDTO {
  @IsOptional()
  @IsEnum(SortValue)
  firstName?: SortValue;

  @IsOptional()
  @IsEnum(SortValue)
  lastName?: SortValue;

  @IsOptional()
  @IsEnum(SortValue)
  email?: SortValue;
}

class FindUsersDTO {
  @ValidateNested()
  @Type(() => FiltersDTO)
  @IsOptional()
  filters?: FiltersDTO;

  @ValidateNested()
  @Type(() => SortDTO)
  @IsOptional()
  sort?: SortDTO;

  @IsString()
  @IsOptional()
  search?: FiltersDTO;

  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  perPage: number;
}

export default FindUsersDTO;

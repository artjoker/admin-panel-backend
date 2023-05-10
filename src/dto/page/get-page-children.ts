import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GetPageChildrenDTO {
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsPositive()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsPositive()
  @IsInt()
  perPage?: number;
}

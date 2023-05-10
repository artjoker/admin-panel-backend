import {
  ValidateNested,
  Length,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  Matches,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

import { MultiLangDTO } from '../language';
import { PageType } from '../../entities/page';

export class UpdatePageDTO {
  @IsNotEmpty()
  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => MultiLangDTO)
  @IsOptional()
  title?: MultiLangDTO;

  @IsOptional()
  @Length(2, 40)
  @Matches(/^[a-z][a-z0-9-]*$/)
  urlSlug?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsNumber()
  sort?: number;

  @ValidateNested()
  @Type(() => MultiLangDTO)
  @IsOptional()
  content?: MultiLangDTO;

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PageType)
  pageType?: PageType;

  @IsOptional()
  images?: string[];
}

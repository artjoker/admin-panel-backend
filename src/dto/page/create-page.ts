import {
  ValidateNested,
  Length,
  IsOptional,
  IsDateString,
  IsNumber,
  IsString,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

import { MultiLangDTO } from '../language';

export class CreatePageDTO {
  @ValidateNested()
  @Type(() => MultiLangDTO)
  title: MultiLangDTO;

  @Length(2, 40)
  @Matches(/^[a-z][a-z0-9-]*$/)
  urlSlug: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ValidateNested()
  @Type(() => MultiLangDTO)
  @IsOptional()
  content?: MultiLangDTO;

  @IsNumber()
  sort: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsString } from 'class-validator';

export class GetPageBySlugDTO {
  @IsString()
  slug: string;
}

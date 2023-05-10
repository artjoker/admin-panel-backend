import { IsString } from 'class-validator';

export class GetPageByIdDTO {
  @IsString()
  id: string;
}

import { IsString } from 'class-validator';

export class DeletePageDTO {
  @IsString()
  id: string;
}

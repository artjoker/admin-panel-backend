import { IsString, IsUUID } from 'class-validator';

export class UploadImageDTO {
  @IsString()
  image: string;
}

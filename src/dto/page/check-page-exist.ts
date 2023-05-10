import { IsUUID } from 'class-validator';

export class CheckPageExistDTO {
  @IsUUID()
  id: string;
}

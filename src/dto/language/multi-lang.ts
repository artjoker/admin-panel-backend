import { IsString } from 'class-validator';

import { Language, MultiLang } from '../../types/language';

export class MultiLangDTO implements MultiLang {
  @IsString()
  [Language.EN]: string;

  @IsString()
  [Language.UK]: string;

  @IsString()
  [Language.RU]: string;
}

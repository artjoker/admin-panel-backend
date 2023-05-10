export enum Language {
  EN = 'en',
  UK = 'uk',
  RU = 'ru',
}

export interface MultiLang {
  [Language.EN]: string;
  [Language.UK]: string;
  [Language.RU]: string;
}

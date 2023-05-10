import { Language, MultiLang } from '../types/language';

export const createEmptyMultiLang = (): MultiLang =>
  Object.values(Language).reduce<MultiLang>(
    (acc, lang) => ({ ...acc, [lang]: '' }),
    {} as MultiLang
  );

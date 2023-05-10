import { ModelDTO } from '../model';
import { ImageDTO } from '../image';
import { MultiLangDTO } from '../language';
import { PageType } from '../../entities/page';

export interface PageDTO extends ModelDTO {
  title: MultiLangDTO;
  urlSlug: string;
  publishedAt: string | null;
  content: MultiLangDTO | null;
  sort: number;
  parent: PageDTO | null;
  children: Array<PageDTO>;
  isActive: boolean;
  pageType: PageType;
  images?: Array<ImageDTO>;
}

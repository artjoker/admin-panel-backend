import { PageType } from '../../entities/page';
import { MultiLangDTO } from '../language';

export class RoutesDTO {
  title: MultiLangDTO;
  urlSlug: string;
  id: string;
  sort: number;
  parent: RoutesDTO | null;
  children: Array<RoutesDTO>;
  pageType: PageType;
}

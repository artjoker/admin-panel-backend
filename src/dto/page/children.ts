import { PageDTO } from './page';

export class ChildrenDTO {
  data: PageDTO[];
  page: number;
  perPage: number;
  totalPages: number;
}

import { Page } from '../entities';
import AppDataSource from '../app-data-source';
import { AppError, HttpCode } from '../exceptions';
import {
  PageDTO,
  GetPageBySlugDTO,
  CreatePageDTO,
  UpdatePageDTO,
  DeletePageDTO,
  GetPageChildrenDTO,
  RoutesDTO,
  GetPageByIdDTO,
  CheckPageExistDTO,
} from '../dto';
import { mapPageToDTO, mapCreatePageDTO, mapRoutesToDTO } from '../mappers';
import { ChildrenDTO } from '../dto/page/children';
import { config } from '../constants/config';

const { PAGE, PER_PAGE } = config;

export class PageService {
  private isPublicApi: boolean;
  private repository = AppDataSource.getTreeRepository(Page);

  constructor({ isPublicApi }: { isPublicApi: boolean }) {
    this.isPublicApi = isPublicApi;
  }

  private filterActivePages = (pages: Array<Page>): Array<Page> => {
    const filteredPages: Array<Page> = [];

    const traverse = (page: Page): Page | null => {
      if (!page.isActive) {
        return null;
      }

      const filteredChildren = page.children
        .map((child) => traverse(child))
        .filter((child) => child !== null) as Array<Page>;

      page.children = filteredChildren;

      return page;
    };

    pages.forEach((page) => {
      const filteredPage = traverse(page);

      if (filteredPage !== null) {
        filteredPages.push(filteredPage);
      }
    });

    return filteredPages;
  };

  public getPages = async (): Promise<Array<PageDTO>> => {
    const pages = await this.repository.find({
      relations: { children: true, parent: true },
    });
    return pages.map(mapPageToDTO);
  };

  public getRoutes = async (): Promise<Array<RoutesDTO>> => {
    const pages = await this.repository.findTrees({
      relations: ['parent', 'children'],
    });

    const activePage = this.filterActivePages(pages);
    return activePage.map(mapRoutesToDTO);
  };

  public getPagesTree = async (): Promise<Array<PageDTO>> => {
    const pages = await this.repository.findTrees({
      relations: ['parent', 'children'],
    });

    const activePage = this.filterActivePages(pages);

    return activePage.map(mapPageToDTO);
  };

  public getPageById = async (
    getPageByIdDTO: GetPageByIdDTO
  ): Promise<PageDTO> => {
    const foundPage = await this.repository.findOne({
      where: {
        id: getPageByIdDTO.id,
      },
      relations: {
        children: true,
        parent: true,
      },
    });

    if (!foundPage) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `Page with such id: (${getPageByIdDTO.id}) does not exist`,
      });
    }

    return mapPageToDTO(foundPage);
  };

  public getPageBySlug = async (
    getPageBySlugDTO: GetPageBySlugDTO
  ): Promise<PageDTO> => {
    const foundPage = await this.repository.findOne({
      where: {
        urlSlug: getPageBySlugDTO.slug,
        isActive: true,
      },
      relations: {
        children: true,
        parent: true,
      },
    });

    if (!foundPage) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `Page with such slug: (${getPageBySlugDTO.slug}) does not exist`,
      });
    }

    return mapPageToDTO(foundPage);
  };

  public getPageChildren = async (getPageChildrenDTO: GetPageChildrenDTO) => {
    const { slug, page = PAGE, perPage = PER_PAGE } = getPageChildrenDTO;

    const foundPage = await this.repository.findOne({
      where: {
        urlSlug: slug,
      },
    });

    if (!foundPage) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `Page with such slug: (${slug}) does not exist`,
      });
    }

    const [children, count] = await this.repository
      .createQueryBuilder('page')
      .where('1 = 1')
      .where('page.parentId = :id', { id: foundPage.id })
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    const mappedUsers = children.map(mapPageToDTO);

    const responseDTO: ChildrenDTO = {
      data: mappedUsers,
      page,
      perPage,
      totalPages: Math.ceil(count / perPage!),
    };

    return responseDTO;
  };

  public createPage = async (
    createPageDTO: CreatePageDTO
  ): Promise<PageDTO> => {
    let pageParent: Page | null = null;

    if (createPageDTO.parentId) {
      const parent = await this.repository.findOne({
        where: {
          id: createPageDTO.parentId,
        },
        relations: {
          children: true,
          parent: true,
        },
      });

      if (!parent) {
        throw new AppError({
          httpCode: HttpCode.NOT_FOUND,
          description: `Parent page with such id (${createPageDTO.parentId}) does not exist`,
        });
      }

      pageParent = parent;
    }

    const page = await this.repository.save(
      this.repository.create(
        mapCreatePageDTO(
          {
            ...createPageDTO,
            isActive: !pageParent ? true : createPageDTO.isActive,
            urlSlug: await this.mapUrlSlug(createPageDTO.urlSlug),
          },
          pageParent
        )
      )
    );

    return mapPageToDTO(page);
  };

  /**
   * Returns unique url slug.
   * Useful when we create or update page
   * with url slug can be potentially not unique.
   */
  private mapUrlSlug = async (initialUrlSlug: string): Promise<string> => {
    const foundPage = await this.repository.findOneBy({
      urlSlug: initialUrlSlug,
    });

    if (foundPage) {
      return this.mapUrlSlug(`${initialUrlSlug}-1`);
    }

    return initialUrlSlug;
  };

  public updatePage = async (
    updatePageDTO: UpdatePageDTO
  ): Promise<PageDTO> => {
    const foundPage = await this.repository.findOneBy({
      id: updatePageDTO.id,
      children: true,
      parent: true,
    });

    if (!foundPage) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `Page with such id (${updatePageDTO.id}) does not exist`,
      });
    }

    foundPage.title = updatePageDTO.title ?? foundPage.title;
    foundPage.urlSlug = updatePageDTO.urlSlug ?? foundPage.urlSlug;
    foundPage.publishedAt = updatePageDTO.publishedAt
      ? new Date(updatePageDTO.publishedAt)
      : foundPage.publishedAt;
    foundPage.content = updatePageDTO.content ?? foundPage.content;
    foundPage.sort = updatePageDTO.sort ?? foundPage.sort;
    foundPage.images = updatePageDTO.images ?? foundPage.images;
    foundPage.isActive = updatePageDTO.isActive ?? foundPage.isActive;
    foundPage.pageType = updatePageDTO.pageType ?? foundPage.pageType;

    if (updatePageDTO.parentId) {
      const parent = await this.repository.findOne({
        where: {
          id: updatePageDTO.parentId,
        },
        relations: {
          children: true,
          parent: true,
        },
      });

      if (!parent) {
        throw new AppError({
          httpCode: HttpCode.NOT_FOUND,
          description: `Parent page with such id (${updatePageDTO.parentId}) does not exist`,
        });
      }

      foundPage.parent = parent;
    }

    if (updatePageDTO.parentId === null) {
      foundPage.parent = null;
    }

    const updatedPage = await this.repository.save(foundPage);

    return mapPageToDTO(updatedPage);
  };

  public deletePage = async (
    deletePageDTO: DeletePageDTO
  ): Promise<PageDTO> => {
    const foundPage = await this.repository.findOne({
      where: {
        id: deletePageDTO.id,
      },
      relations: {
        children: true,
        parent: true,
      },
    });

    if (!foundPage) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `Page with such id (${deletePageDTO.id}) does not exist`,
      });
    }

    const deletedPage = await foundPage.remove();

    return mapPageToDTO(deletedPage);
  };

  public checkPageExist = async (checkPageExistDTO: CheckPageExistDTO) => {
    const foundPage = await this.repository.findOneBy({
      id: checkPageExistDTO.id,
    });

    if (!foundPage) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `Page with such id (${checkPageExistDTO.id}) does not exist`,
      });
    }
  };
}

import { NextFunction, Request, Response } from 'express';

import { PageService } from '../services';
import {
  CheckPageExistDTO,
  CreatePageDTO,
  DeletePageDTO,
  GetPageByIdDTO,
  GetPageBySlugDTO,
  GetPageChildrenDTO,
  UpdatePageDTO,
  UploadImageDTO,
} from '../dto';
import { validateDTO } from '../utils';
import { MultiLangDTO } from '../dto/language';
import { Language } from '../types/language';
import { ChildrenDTO } from '../dto/page/children';
import { config } from '../constants/config';

const { PAGE, PER_PAGE } = config;

export class PageController {
  private isPublicApi: boolean;
  private pageService: PageService;

  constructor({ isPublicApi }: { isPublicApi: boolean }) {
    this.isPublicApi = isPublicApi;
    this.pageService = new PageService({ isPublicApi });
  }

  public getPages = async (_: Request, res: Response, next: NextFunction) => {
    try {
      if (this.isPublicApi) {
        const responseDTO = await this.pageService.getPagesTree();
        res.status(200).json(responseDTO);
        return;
      }

      const responseDTO = await this.pageService.getPages();
      res.status(200).json(responseDTO);
    } catch (err) {
      next(err);
    }
  };

  public getRoutes = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const responseDTO = await this.pageService.getRoutes();
      res.status(200).json(responseDTO);
    } catch (err) {
      next(err);
    }
  };

  public getPageById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const getPageByIdDTO = new GetPageByIdDTO();
      getPageByIdDTO.id = req.params.pageId;

      await validateDTO(getPageByIdDTO);

      const pageDTO = await this.pageService.getPageById(getPageByIdDTO);

      res.status(200).json(pageDTO);
    } catch (err) {
      next(err);
    }
  };

  public getPageBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const getPageBySlugDTO = new GetPageBySlugDTO();
      getPageBySlugDTO.slug = req.params.slug;

      await validateDTO(getPageBySlugDTO);

      const pageDTO = await this.pageService.getPageBySlug(getPageBySlugDTO);

      res.status(200).json(pageDTO);
    } catch (err) {
      next(err);
    }
  };

  public getPageChildren = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const getPageChildrenDTO = new GetPageChildrenDTO();
      getPageChildrenDTO.slug = req.params.slug;
      getPageChildrenDTO.page =
        req.query.page === undefined ? PAGE : Number(req.query.page);
      getPageChildrenDTO.perPage =
        req.query.perPage === undefined ? PER_PAGE : Number(req.query.perPage);

      await validateDTO(getPageChildrenDTO);

      const childrenDTO: ChildrenDTO = await this.pageService.getPageChildren(
        getPageChildrenDTO
      );

      res.status(200).json(childrenDTO);
    } catch (err) {
      next(err);
    }
  };

  public createPage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createPageDTO = new CreatePageDTO();

      const titleDTO = new MultiLangDTO();
      titleDTO[Language.EN] = req.body.title[Language.EN];
      titleDTO[Language.UK] = req.body.title[Language.UK];
      titleDTO[Language.RU] = req.body.title[Language.RU];
      createPageDTO.title = titleDTO;

      createPageDTO.urlSlug = req.body.urlSlug?.toLowerCase().trim();
      createPageDTO.publishedAt = req.body.publishedAt;

      if (req.body.content) {
        const contentDTO = new MultiLangDTO();
        contentDTO[Language.EN] = req.body.content[Language.EN];
        contentDTO[Language.UK] = req.body.content[Language.UK];
        contentDTO[Language.RU] = req.body.content[Language.RU];
        createPageDTO.content = contentDTO;
      }

      createPageDTO.sort = req.body.sort;
      createPageDTO.parentId = req.body.parentId;
      createPageDTO.isActive = req.body.isActive || false;

      await validateDTO(createPageDTO);

      const pageDTO = await this.pageService.createPage(createPageDTO);

      return res.status(201).json(pageDTO);
    } catch (err) {
      next(err);
    }
  };

  public updatePage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageId } = req.params;

      const updatePageDTO = new UpdatePageDTO();

      updatePageDTO.id = pageId;

      if (req.body.title) {
        const titleDTO = new MultiLangDTO();
        titleDTO[Language.EN] = req.body.title[Language.EN];
        titleDTO[Language.UK] = req.body.title[Language.UK];
        titleDTO[Language.RU] = req.body.title[Language.RU];
        updatePageDTO.title = titleDTO;
      }

      updatePageDTO.urlSlug = req.body.urlSlug?.toLowerCase().trim();
      updatePageDTO.publishedAt = req.body.publishedAt;
      updatePageDTO.images = req.body.images;

      if (req.body.content) {
        const contentDTO = new MultiLangDTO();
        contentDTO[Language.EN] = req.body.content[Language.EN];
        contentDTO[Language.UK] = req.body.content[Language.UK];
        contentDTO[Language.RU] = req.body.content[Language.RU];
        updatePageDTO.content = contentDTO;
      }

      updatePageDTO.pageType = req.body.pageType;
      updatePageDTO.sort = req.body.sort;
      updatePageDTO.parentId = req.body.parentId;
      updatePageDTO.isActive = req.body.isActive;

      await validateDTO(updatePageDTO);

      const pageDTO = await this.pageService.updatePage(updatePageDTO);

      return res.status(200).json(pageDTO);
    } catch (err) {
      next(err);
    }
  };

  public uploadImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const uploadImageDTO = new UploadImageDTO();

      if (req.file) {
        uploadImageDTO.image = req.file.filename;
      }

      await validateDTO(uploadImageDTO);

      return res.status(200).json(uploadImageDTO.image);
    } catch (err) {
      next(err);
    }
  };

  public checkPageExist = async (
    req: Request,
    _: Response,
    next: NextFunction
  ) => {
    try {
      const { pageId } = req.params;

      const checkUserDTO = new CheckPageExistDTO();

      checkUserDTO.id = pageId;

      await validateDTO(checkUserDTO);
      await this.pageService.checkPageExist(checkUserDTO);

      next();
    } catch (err) {
      next(err);
    }
  };

  public deletePage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { pageId } = req.params;

      const deletePageDTO = new DeletePageDTO();

      deletePageDTO.id = pageId;

      await validateDTO(deletePageDTO);

      const pageDTO = await this.pageService.deletePage(deletePageDTO);

      res.status(200).json(pageDTO);
    } catch (err) {
      next(err);
    }
  };
}

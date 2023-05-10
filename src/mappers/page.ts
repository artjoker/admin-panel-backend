import { DeepPartial } from 'typeorm';

import { CreatePageDTO, PageDTO, RoutesDTO } from '../dto';
import { Page } from '../entities';
import { createEmptyMultiLang } from '../utils';

export const mapPageToDTO = (page: Page): PageDTO => ({
  id: page.id,
  createdAt: page?.createdAt?.toISOString(),
  updatedAt: page?.updatedAt?.toISOString(),
  title: page.title,
  urlSlug: page.urlSlug,
  publishedAt: page.publishedAt ? page?.publishedAt?.toISOString() : null,
  content: page?.content,
  sort: page?.sort ? Number(page.sort) : page.sort,
  parent: page?.parent ? mapPageToDTO(page.parent) : null,
  children: page?.children ? page?.children.map(mapPageToDTO) : [],
  isActive: page?.isActive,
  images: (page.images ?? []).map((image) => ({
    id: image,
    url: `https://${process.env.HOSTNAME}/storage/${image}`,
  })),
  pageType: page.pageType,
});

export const mapRoutesToDTO = (page: Page): RoutesDTO => ({
  id: page.id,
  title: page.title,
  urlSlug: page.urlSlug,
  sort: page?.sort ? Number(page.sort) : page.sort,
  parent: page?.parent ? mapRoutesToDTO(page.parent) : null,
  pageType: page.pageType,
  children: page?.children ? page?.children.map(mapRoutesToDTO) : [],
});

export const mapCreatePageDTO = (
  createPageDTO: CreatePageDTO,
  parent: Page | null = null
): DeepPartial<Page> => ({
  title: createPageDTO.title,
  urlSlug: createPageDTO.urlSlug,
  publishedAt: createPageDTO.publishedAt
    ? new Date(createPageDTO.publishedAt)
    : null,
  sort: createPageDTO.sort,
  content: createPageDTO.content ?? createEmptyMultiLang(),
  parent: parent,
  isActive: createPageDTO.isActive,
});

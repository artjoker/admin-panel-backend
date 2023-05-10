import {
  Entity,
  Column,
  Unique,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { IsEnum, Length, Matches } from 'class-validator';

import { MultiLang } from '../types/language';

import Model from './model';

export enum PageType {
  TEMPLATE = 'template',
  HOME = 'home',
  CONTACTS = 'contacts',
  BLOG = 'blog',
  ARTICLE = 'article',
}

@Entity('page')
@Unique(['urlSlug'])
@Tree('nested-set')
export class Page extends Model {
  @Column('jsonb')
  title: MultiLang;

  @Column()
  @Length(2, 40)
  @Matches(/^[a-z][a-z0-9-]*$/)
  urlSlug: string;

  @Column('timestamp', { nullable: true })
  publishedAt: Date | null;

  @Column('jsonb', { nullable: true })
  content: MultiLang | null;

  @Column('decimal')
  sort: number;

  @Column({ default: PageType.TEMPLATE })
  @IsEnum(PageType)
  pageType: PageType;

  @Column('boolean', { default: false })
  isActive: boolean;

  @TreeChildren()
  children: Page[];

  @TreeParent()
  parent: Page | null;

  @Column('text', { array: true, nullable: true })
  images?: string[];
}

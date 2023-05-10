import { UserRole } from '../src/entities/role';
import { config } from '../src/constants/config';
import {
  ChildrenDTO,
  CreatePageDTO,
  CreateUserDTO,
  ImageDTO,
  LoginDTO,
  PageDTO,
  RegisterDTO,
  RoutesDTO,
  TokenDTO,
  UpdatePageDTO,
  UpdateUserDTO,
  UserDTO,
} from '../src/dto';
import { User } from '../src/entities';
import { MultiLangDTO } from '../src/dto/language';

const REGEXP_JWT: RegExp =
  /^eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*$/;
const REGEXP_UUID: RegExp =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
const REGEXP_DATE: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const regexpFirstName: RegExp = /^.{1,100}$/;
const regexpLastName: RegExp = /^.{1,100}$/;
const regexpUserRole: RegExp = /Admin|User/;
const regexpEmail: RegExp = /^\w+([-+.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,6})+$/;
const REGEXP_PAGE_SLUG: RegExp = /^[a-z][a-z0-9-]*$/;
const { ADMIN_CREDS, PAGE, PER_PAGE } = config;

export const NON_EXISTED_SLUG = 'laskjdureifyhgtqxpmmnzqowvdgfkl';
export const NON_EXISTED_ID = '00000000-0000-0000-0000-000000000000';

// REQUEST
export const testData = {
  // auth
  adminUser: {
    email: ADMIN_CREDS.email,
    password: ADMIN_CREDS.password,
    isActive: ADMIN_CREDS.isActive,
    firstName: ADMIN_CREDS.firstName,
    lastName: ADMIN_CREDS.lastName,
    role: ADMIN_CREDS.role,
  } as User,

  clientUser: {
    email: 'user@user.com'.toLowerCase(),
    password: 'Qwerty12345',
    isActive: false,
    firstName: 'User',
    lastName: 'Client',
    role: UserRole.USER,
  } as User,

  clientUserTwo: {
    email: 'user-two@user.com'.toLowerCase(),
    password: 'Qwerty12345',
    isActive: true,
    firstName: 'User-two',
    lastName: 'Client-two',
    role: UserRole.USER,
  } as User,

  clientUserThree: {
    email: 'user-three@user.com'.toLowerCase(),
    password: 'Qwerty12345',
    isActive: true,
    firstName: 'User-three',
    lastName: 'Client-three',
    role: UserRole.USER,
  } as User,

  adminUpdateUser: {
    email: 'adminupd@admin.com',
    password: 'Qwerty12345UPD',
    isActive: true,
    firstName: 'AdminUPD',
    lastName: 'AdminUPD',
    role: UserRole.USER,
  } as User,

  clientUpdateUser: {
    email: 'userupd@user.com',
    password: 'Qwerty12345UPD',
    isActive: false,
    firstName: 'UserUPD',
    lastName: 'ClientUPD',
    role: UserRole.USER,
  } as User,

  invalidUser: {
    email: '',
    password: '',
    isActive: '',
    firstName: '',
    lastName: '',
    role: '',
  } as unknown as User,

  nonExistedUser: {
    email: 'non-existed@user.com',
    password: 'Qwerty12345',
    isActive: false,
    firstName: 'NonExistedUser',
    lastName: 'NonExistedClient',
    role: UserRole.USER,
  } as User,

  // page
  parentPage: {
    title: {
      en: 'Parent page title',
      uk: '',
      ru: '',
    },
    content: {
      en: 'Parent page content',
      uk: '',
      ru: '',
    },
    urlSlug: 'parent-page'.toLowerCase(),
    sort: 1,
    isActive: true,
    publishedAt: '1970-01-01T00:00:00.000Z',
    parentId: null,
    parent: null,
    pageType: 'template',
  } as any,

  parentPageUpdate: {
    title: {
      en: 'Parent page title update',
      uk: '',
      ru: '',
    },
    content: {
      en: 'Parent page content update',
      uk: '',
      ru: '',
    },
    urlSlug: 'parent-page-update'.toLowerCase(),
    sort: 1,
    isActive: true,
    publishedAt: '2000-01-01T00:00:00.000Z',
    parentId: null,
    parent: null,
    pageType: 'blog',
    //   images?: string[];
  } as any,

  childPageOne: {
    title: {
      en: 'Child page one title',
      uk: '',
      ru: '',
    },
    content: {
      en: 'Child page one content',
      uk: '',
      ru: '',
    },
    urlSlug: 'child-page-one'.toLowerCase(),
    sort: 1,
    parentId: null,
    isActive: true,
    publishedAt: '1970-01-01T00:00:00.000Z',
    parent: null,
    pageType: 'template',
  } as any,

  childPageOneUpdate: {
    title: {
      en: 'Child page one title update',
      uk: '',
      ru: 'Обновлённый заголовок страницы',
    },
    urlSlug: 'child-page-one-update',
    sort: 1,
    parentId: null,
    isActive: true,
    publishedAt: '1981-01-09T16:15:41.590Z',
    content: {
      en: 'Child page one content update',
      uk: '',
      ru: 'Обновлённый контент страницы',
    },
    images: ['1681765502298g2.jpeg', '1681763794886g5.jpeg'],
    pageType: 'blog',
  } as any,

  childPageTwo: {
    title: {
      en: 'Child page two title',
      uk: '',
      ru: '',
    },
    content: {
      en: 'Child page two content',
      uk: '',
      ru: '',
    },
    urlSlug: 'child-page-two'.toLowerCase(),
    sort: 1,
    parentId: null,
    isActive: true,
    publishedAt: '1970-01-01T00:00:00.000Z',
    parent: null,
    pageType: 'template',
  } as any,

  childPageThree: {
    title: {
      en: 'Child page three title',
      uk: '',
      ru: '',
    },
    content: {
      en: 'Child page three content',
      uk: '',
      ru: '',
    },
    urlSlug: 'child-page-three'.toLowerCase(),
    sort: 1,
    parentId: null,
    isActive: true,
    publishedAt: '1970-01-01T00:00:00.000Z',
    parent: null,
    pageType: 'template',
  } as any,

  invalidPage: {
    title: '',
    content: '',
    urlSlug: '',
    sort: '',
    parentId: '',
    isActive: '',
    publishedAt: '',
    parent: '',
    pageType: '',
  } as any,
};

const {
  adminUser,
  clientUser,
  clientUserTwo,
  clientUserThree,
  invalidUser,
  nonExistedUser,
  adminUpdateUser,
  clientUpdateUser,
  parentPage,
  childPageOne,
  childPageOneUpdate,
  childPageTwo,
  childPageThree,
  invalidPage,
} = testData;

export const requestTestData = {
  // auth
  adminLoginData: {
    email: adminUser.email,
    password: adminUser.password,
  } as LoginDTO,

  clientLoginData: {
    email: clientUser.email,
    password: clientUser.password,
  } as LoginDTO,

  invalidLoginData: {
    email: invalidUser.email,
    password: invalidUser.password,
  } as LoginDTO,

  nonExistedLoginData: {
    email: nonExistedUser.email,
    password: nonExistedUser.password,
  } as LoginDTO,

  // for utils
  AdminRegisterData_AdminPath: {
    email: adminUser.email,
    firstName: adminUser.firstName,
    lastName: adminUser.lastName,
    password: adminUser.password,
    isActive: adminUser.isActive,
    role: adminUser.role,
  } as CreateUserDTO,

  // for utils
  clientRegisterData_AdminPath: {
    firstName: clientUser.firstName,
    lastName: clientUser.lastName,
    email: clientUser.email,
    password: clientUser.password,
    isActive: clientUser.isActive,
  } as CreateUserDTO,

  clientRegisterDataTwo_AdminPath: {
    firstName: clientUserTwo.firstName,
    lastName: clientUserTwo.lastName,
    email: clientUserTwo.email,
    password: clientUserTwo.password,
    isActive: clientUserTwo.isActive,
  } as RegisterDTO,

  clientRegisterDataThree_AdminPath: {
    firstName: clientUserThree.firstName,
    lastName: clientUserThree.lastName,
    email: clientUserThree.email,
    password: clientUserThree.password,
    isActive: clientUserThree.isActive,
  } as RegisterDTO,

  clientRegisterData_PublicPath: {
    firstName: clientUser.firstName,
    lastName: clientUser.lastName,
    email: clientUser.email,
    password: clientUser.password,
  } as RegisterDTO,

  invalidRegisterData: {
    firstName: invalidUser.firstName,
    lastName: invalidUser.lastName,
    email: invalidUser.email,
    password: invalidUser.password,
  } as RegisterDTO,

  duplicateRegisterData: {
    firstName: clientUser.firstName,
    lastName: clientUser.lastName,
    email: clientUser.email,
    password: clientUser.password,
  } as RegisterDTO,

  adminUpdateData_AdminPath: {
    firstName: adminUpdateUser.firstName,
    lastName: adminUpdateUser.lastName,
    email: adminUpdateUser.email,
    password: adminUpdateUser.password,
    isActive: adminUpdateUser.isActive,
  } as UpdateUserDTO,
  clientUpdateData_AdminPath: {
    firstName: clientUpdateUser.firstName,
    lastName: clientUpdateUser.lastName,
    email: clientUpdateUser.email,
    password: clientUpdateUser.password,
    isActive: clientUpdateUser.isActive,
  } as UpdateUserDTO,

  clientUpdateData_PublicPath: {
    firstName: clientUpdateUser.firstName,
    lastName: clientUpdateUser.lastName,
    email: clientUpdateUser.email,
    password: clientUpdateUser.password,
  } as UpdateUserDTO,

  invalidClientUpdateData: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  } as UpdateUserDTO,

  // user
  dataToFindAllUsers: {
    page: PAGE,
    perPage: PER_PAGE,
  },

  wrongDataToFindAllUsers: {
    page: 'дичь',
    perPage: 'trash',
  },

  dataToFindFilterUser: {
    page: PAGE,
    perPage: PER_PAGE,
    sort: {
      firstName: 'ASC',
      lastName: 'DESC',
      email: 'ASC',
    },
    filters: {
      firstName: clientUser.firstName,
      lastName: clientUser.lastName,
      email: clientUser.email,
      isActive: false,
    },
    search: clientUser.lastName.slice(1, 2),
  },

  //page
  parentPageDataToCreate: {
    title: parentPage.title,
    content: parentPage.content,
    urlSlug: parentPage.urlSlug,
    sort: parentPage.sort,
    isActive: parentPage.isActive,
    publishedAt: parentPage.publishedAt,
    parentId: parentPage.parentId,
  } as CreatePageDTO,

  childPageDataToCreate: {
    title: childPageOne.title,
    content: childPageOne.content,
    urlSlug: childPageOne.urlSlug,
    sort: childPageOne.sort,
    isActive: childPageOne.isActive,
    publishedAt: childPageOne.publishedAt,
    parentId: null,
  } as unknown as CreatePageDTO,

  childPageOneData: {
    title: childPageOne.title,
    urlSlug: childPageOne.urlSlug,
    sort: childPageOne.sort,
    parentId: childPageOne.parentId,
    content: childPageOne.content,
    isActive: childPageOne.isActive,
    publishedAt: childPageOne.publishedAt,
  } as CreatePageDTO,

  childPageOneUpdateData: {
    title: childPageOneUpdate.title,
    urlSlug: childPageOneUpdate.urlSlug,
    sort: childPageOneUpdate.sort,
    parentId: childPageOneUpdate.parentId,
    content: childPageOneUpdate.content,
    isActive: childPageOneUpdate.isActive,
    publishedAt: childPageOneUpdate.publishedAt,
    images: childPageOneUpdate.images,
    pageType: childPageOneUpdate.pageType,
  } as UpdatePageDTO,

  childPageTwoData: {
    title: childPageTwo.title,
    urlSlug: childPageTwo.urlSlug,
    sort: childPageTwo.sort,
    parentId: childPageTwo.parentId,
    content: childPageTwo.content,
    isActive: childPageTwo.isActive,
    publishedAt: childPageTwo.publishedAt,
  } as CreatePageDTO,

  childPageThreeData: {
    title: childPageThree.title,
    urlSlug: childPageThree.urlSlug,
    sort: childPageThree.sort,
    parentId: childPageThree.parentId,
    content: childPageThree.content,
    isActive: childPageThree.isActive,
    publishedAt: childPageThree.publishedAt,
  } as CreatePageDTO,

  invalidPageData: {
    title: invalidPage.title,
    urlSlug: invalidPage.urlSlug,
    sort: invalidPage.sort,
    parentId: invalidPage.parentId,
    content: invalidPage.content,
    isActive: invalidPage.isActive,
    publishedAt: invalidPage.publishedAt,
  } as CreatePageDTO,
};

// RESPONSE
export const expectedResponseTestData = {
  // auth-user
  expectedResponseTokenDTO: {
    token: expect.stringMatching(REGEXP_JWT),
  } as TokenDTO,

  expectedResponseAdmin: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    firstName: adminUser.firstName,
    lastName: adminUser.lastName,
    email: adminUser.email,
    isActive: adminUser.isActive,
    role: adminUser.role,
  } as UserDTO,

  expectedResponseUser: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    firstName: clientUser.firstName,
    lastName: clientUser.lastName,
    email: clientUser.email,
    isActive: clientUser.isActive,
    role: clientUser.role,
  } as UserDTO,

  expectedResponseUserTwo: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    firstName: clientUserTwo.firstName,
    lastName: clientUserTwo.lastName,
    email: clientUserTwo.email,
    isActive: clientUserTwo.isActive,
    role: clientUserTwo.role,
  } as UserDTO,

  expectedResponseUpdatedAdminUser: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    firstName: adminUpdateUser.firstName,
    lastName: adminUpdateUser.lastName,
    email: adminUpdateUser.email,
    isActive: adminUpdateUser.isActive,
    role: adminUser.role,
  } as UserDTO,

  expectedResponseUpdatedClientUser: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    firstName: clientUpdateUser.firstName,
    lastName: clientUpdateUser.lastName,
    email: clientUpdateUser.email,
    isActive: clientUser.isActive,
    role: clientUser.role,
  } as UserDTO,

  expectedResponseFindAllUsers: {
    data: expect.any(Array),
    page: PAGE,
    perPage: PER_PAGE,
    totalPages: 1,
  } as ChildrenDTO,

  //page
  expectedResponsePageChildren: {
    data: expect.any(Array),
    page: PAGE,
    perPage: PER_PAGE,
    totalPages: 1,
  } as ChildrenDTO,

  expectedResponseAllPages_PublicPath: {
    id: expect.stringMatching(REGEXP_UUID),
    title: parentPage.title,
    urlSlug: parentPage.urlSlug,
    sort: parentPage.sort,
    parent: parentPage.parent,
    children: expect.any(Array),
    pageType: parentPage.pageType,
  } as RoutesDTO,

  expectedResponseChildPage_PublicPath: {
    id: expect.stringMatching(REGEXP_UUID),
    title: childPageOne.title,
    urlSlug: childPageOne.urlSlug,
    sort: childPageOne.sort,
    parent: expect.any(Object),
    children: expect.any(Array),
    pageType: childPageOne.pageType,
  } as RoutesDTO,

  // ADMIN PATH
  expectedResponseAnyPage_AdminPath: {
    id: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    title: expect.objectContaining({
      en: expect.any(String),
      ru: expect.any(String),
      uk: expect.any(String),
    }),
    urlSlug: expect.any(String),
    publishedAt: expect.any(String),
    content: expect.objectContaining({
      en: expect.any(String),
      ru: expect.any(String),
      uk: expect.any(String),
    }),
    sort: expect.any(Number),
    parent: expect.objectContaining({
      ...expect.anything(),
    }),
    children: expect.any(Array),
    isActive: expect.any(Boolean),
    images: expect.any(Array),
    pageType: expect.any(String),
  } as PageDTO,

  expectedResponseParentPage_AdminPath: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    title: parentPage.title,
    urlSlug: parentPage.urlSlug,
    publishedAt: parentPage.publishedAt,
    content: parentPage.content,
    sort: parentPage.sort,
    parent: null,
    children: expect.any(Array),
    isActive: parentPage.isActive,
    images: expect.any(Array),
    pageType: parentPage.pageType,
  } as PageDTO,

  expectedResponseChildPageOne_AdminPath: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    title: childPageOne.title,
    urlSlug: childPageOne.urlSlug,
    publishedAt: childPageOne.publishedAt,
    content: childPageOne.content,
    sort: childPageOne.sort,
    parent: expect.any(Object),
    children: expect.any(Array),
    isActive: childPageOne.isActive,
    images: expect.any(Array),
    pageType: childPageOne.pageType,
  } as PageDTO,

  expectedChildPageOneUpdated_AdminPath: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    title: childPageOneUpdate.title,
    urlSlug: childPageOneUpdate.urlSlug,
    publishedAt: childPageOneUpdate.publishedAt,
    content: childPageOneUpdate.content,
    sort: childPageOneUpdate.sort,
    parent: expect.any(Object),
    children: expect.any(Array),
    isActive: childPageOneUpdate.isActive,
    images: expect.any(Array),
    pageType: childPageOneUpdate.pageType,
  } as PageDTO,

  expectedResponseChildPageThree_AdminPath: {
    id: expect.stringMatching(REGEXP_UUID),
    createdAt: expect.stringMatching(REGEXP_DATE),
    updatedAt: expect.stringMatching(REGEXP_DATE),
    title: childPageThree.title,
    urlSlug: childPageThree.urlSlug,
    publishedAt: childPageThree.publishedAt,
    content: childPageThree.content,
    sort: childPageThree.sort,
    parent: expect.any(Object),
    children: expect.any(Array),
    isActive: childPageThree.isActive,
    images: expect.any(Array),
    pageType: childPageThree.pageType,
  } as PageDTO,
};

import { CreatePageDTO, PageDTO, TokenDTO, UserDTO } from '../src/dto';
import { PageService, UserService } from '../src/services';
import { requestTestData } from './test-constants';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../src/app';

const {
  adminLoginData,
  clientLoginData,
  AdminRegisterData_AdminPath,
  clientRegisterData_AdminPath,
  dataToFindAllUsers,
  parentPageDataToCreate,
  childPageOneData,
  childPageTwoData,
} = requestTestData;

export const createAdminUser = async (): Promise<UserDTO> => {
  const adminUserService = new UserService({ isPublicApi: false });
  const user = await adminUserService.createUser(AdminRegisterData_AdminPath);
  return user;
};

export const createClientUser = async (): Promise<UserDTO> => {
  const clientUserService = new UserService({ isPublicApi: true });
  const user = await clientUserService.createUser(clientRegisterData_AdminPath);
  return user;
};

export const createPage = async (newPage: CreatePageDTO): Promise<PageDTO> => {
  const pageService = new PageService({ isPublicApi: false });
  const page = await pageService.createPage(newPage);
  return page;
};

export const initUserEntities = async () => {
  await createAdminUser();
  await createClientUser();

  const adminResponse = await request(app)
    .post('/admin/auth/login')
    .send(adminLoginData);
  const _adminToken: TokenDTO = adminResponse.body.token;

  const userResponse = await request(app)
    .post('/public/auth/login')
    .send(clientLoginData);
  const _clientToken: TokenDTO = userResponse.body.token;

  const userDataResponse = await request(app)
    .post('/admin/users/find')
    .set('Authorization', `Bearer ${_adminToken}`)
    .send(dataToFindAllUsers);

  const admin = userDataResponse.body.data.find(
    (item: UserDTO) => item.email === adminLoginData.email
  );
  const _adminUserId: string = admin.id;

  const client = userDataResponse.body.data.find(
    (item: UserDTO) => item.email === clientLoginData.email
  );
  const _clientUserId: string = client.id;

  return { _adminToken, _clientToken, _adminUserId, _clientUserId };
};

export const initPageEntities = async () => {
  const _parentPage: PageDTO = await createPage(parentPageDataToCreate);
  childPageOneData.parentId = _parentPage.id;
  childPageTwoData.parentId = _parentPage.id;
  childPageOneData.isActive = true;
  childPageTwoData.isActive = true;
  const _childPageFirst: PageDTO = await createPage(childPageOneData);
  const _childPageSecond: PageDTO = await createPage(childPageTwoData);
  _parentPage.children = [_childPageFirst, _childPageSecond];

  return { _parentPage, _childPageFirst, _childPageSecond };
};

export const removeUploadedFile = async (fileName: string) => {
  const pathToDeleteFile = path.join(__dirname, `../storage/${fileName}`);
  try {
    await fs.rm(pathToDeleteFile);
    console.log(`${fileName} deleted`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

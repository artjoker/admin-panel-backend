import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import { Database } from '../../../src/db';
import {
  createAdminUser,
  createClientUser,
  initPageEntities,
  removeUploadedFile,
} from '../../test-utils';
import {
  expectedResponseTestData,
  NON_EXISTED_ID,
  requestTestData,
} from '../../test-constants';
import { PageDTO, TokenDTO } from '../../../src/dto';
import path from 'path';
import { app } from '../../../src/app';

const DB = new Database();
const filePath: string = path.join(__dirname, `../../img/test_img.jpeg`);

const {
  adminLoginData,
  clientLoginData,
  childPageThreeData,
  childPageOneUpdateData,
  invalidPageData,
} = requestTestData;

const {
  expectedResponseAnyPage_AdminPath,
  expectedResponseParentPage_AdminPath,
  expectedResponseChildPageThree_AdminPath,
  expectedResponseChildPageOne_AdminPath,
  expectedChildPageOneUpdated_AdminPath,
} = expectedResponseTestData;

let parentPage: PageDTO;
let parentPageID: string;
let childPageFirst: PageDTO;
let childPageFirstID: string;
let adminToken: TokenDTO;
let clientToken: TokenDTO;

beforeAll(async () => {
  await DB.connect();
  await DB.clear();
  await DB.synchronize();
  await createAdminUser();
  await createClientUser();
  const adminResponse = await request(app)
    .post('/admin/auth/login')
    .send(adminLoginData);
  adminToken = adminResponse.body.token;
  const userResponse = await request(app)
    .post('/public/auth/login')
    .send(clientLoginData);
  clientToken = userResponse.body.token;
});

afterAll(async () => {
  await DB.clear();
  await DB.disconnect();
});

describe('GET /admin/pages/', () => {
  beforeAll(async () => {
    await initPageEntities();
  });

  it('should get all pages (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .get('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(200);
    expect([expectedResponseAnyPage_AdminPath]).toContainEqual(
      expect.objectContaining(expectedResponseAnyPage_AdminPath)
    );
    const parentPage = response.body.find(
      (item: PageDTO) =>
        item.urlSlug === expectedResponseParentPage_AdminPath.urlSlug
    );
    expect(parentPage).toHaveProperty(
      'pageType',
      expectedResponseParentPage_AdminPath.pageType
    );
  });

  it('should not get all pages (by user with role=ADMIN only) ("Invalid request")', async () => {
    const response = await request(app)
      .get('/admin/pages/')
      .set('Authorization', `Bearer ${'wrong-token'}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not get all pages (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app).get('/admin/pages/');
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not get all pages (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .get('/admin/pages/')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not get all pages (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .get('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('POST /admin/pages/', () => {
  beforeAll(async () => {
    const { _parentPage } = await initPageEntities();
    parentPageID = _parentPage.id;
    parentPage = _parentPage;
    childPageThreeData.parentId = parentPageID;
  });

  it('should create page (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .post('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(childPageThreeData);
    expect(response.status).toEqual(201);
    expect(response.body).toMatchObject(
      expectedResponseChildPageThree_AdminPath
    );
  });

  it('should not create page (by user with role=ADMIN only) ("Invalid request")', async () => {
    const response = await request(app)
      .post('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPageData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not create page (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app)
      .post('/admin/pages/')
      .send(childPageThreeData);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not create page (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .post('/admin/pages/')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(childPageThreeData);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not create page if non-existed parent page (by user with role=ADMIN only)', async () => {
    parentPageID = NON_EXISTED_ID;
    childPageThreeData.parentId = parentPageID;
    const response = await request(app)
      .post('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(childPageThreeData);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Parent page with such id (${NON_EXISTED_ID}) does not exist`
    );
  });

  it('should not create page (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .post('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(childPageThreeData);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('GET /admin/pages/:pageId', () => {
  beforeAll(async () => {
    const { _childPageFirst } = await initPageEntities();
    childPageFirstID = _childPageFirst.id;
  });

  it('should get page by ID (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .get(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseChildPageOne_AdminPath);
    expect(response.body).toHaveProperty(
      'urlSlug',
      expectedResponseChildPageOne_AdminPath.urlSlug
    );
  });

  it('should not get page by ID (by user with role=ADMIN only) ("Invalid request")', async () => {
    const response = await request(app)
      .get(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${'wrong-token'}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not get page by ID (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app).get(`/admin/pages/${childPageFirstID}`);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not get page by ID (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .get(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not get non-existed page by ID (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .get(`/admin/pages/${NON_EXISTED_ID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Page with such id: (${NON_EXISTED_ID}) does not exist`
    );
  });

  it('should not get page by ID (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .get('/admin/pages/')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('PATCH /admin/pages/:pageId', () => {
  beforeAll(async () => {
    const { _parentPage, _childPageFirst } = await initPageEntities();
    childPageFirst = _childPageFirst;
    childPageFirstID = _childPageFirst.id;
    childPageOneUpdateData.parentId = _parentPage.id;
  });

  it('should update page (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .patch(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(childPageOneUpdateData);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedChildPageOneUpdated_AdminPath);
    expect(response.body).toHaveProperty(
      'urlSlug',
      expectedChildPageOneUpdated_AdminPath.urlSlug
    );
  });

  it('should not update page (by user with role=ADMIN only) ("Invalid request")', async () => {
    const response = await request(app)
      .patch(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPageData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not update page (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app)
      .patch(`/admin/pages/${childPageFirstID}`)
      .send(childPageOneUpdateData);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not update page (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .patch(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send(childPageOneUpdateData);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not update page if non-existed page (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .patch(`/admin/pages/${NON_EXISTED_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(childPageOneUpdateData);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Page with such id (${NON_EXISTED_ID}) does not exist`
    );
  });

  it('should not update page (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .patch(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(childPageOneUpdateData);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('DELETE /admin/pages/:pageId', () => {
  beforeAll(async () => {
    const { _parentPage, _childPageFirst } = await initPageEntities();
    childPageFirst = _childPageFirst;
    childPageFirstID = _childPageFirst.id;
    childPageOneUpdateData.parentId = _parentPage.id;
  });

  it('should not delete page (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app).delete(
      `/admin/pages/${childPageFirstID}`
    );
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not delete page (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .delete(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not delete page if non-existed page (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .delete(`/admin/pages/${NON_EXISTED_ID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Page with such id (${NON_EXISTED_ID}) does not exist`
    );
  });

  it('should delete page (by user with role=ADMIN only)', async () => {
    const { id, ...rest } = expectedResponseChildPageOne_AdminPath;
    const expectedResponseChildPageOne_del = { ...rest };
    const response = await request(app)
      .delete(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseChildPageOne_del);
    expect(response.body).toHaveProperty(
      'urlSlug',
      expectedResponseChildPageOne_del.urlSlug
    );
  });

  it('should not delete page (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .delete(`/admin/pages/${childPageFirstID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('POST /admin/pages/:pageId/upload', () => {
  beforeAll(async () => {
    const { _childPageFirst } = await initPageEntities();
    childPageFirstID = _childPageFirst.id;
  });

  it('should upload image', async () => {
    const response = await request(app)
      .post(`/admin/pages/${childPageFirstID}/upload`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', filePath);
    expect(response.status).toEqual(200);
    expect(response.body).toMatch(/^\d/);

    const fileName = response.body;
    await removeUploadedFile(fileName);
  });

  it('should not upload image ("Invalid request")', async () => {
    const response = await request(app)
      .post(`/admin/pages/${childPageFirstID}/upload`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not upload image ("Unauthorized")', async () => {
    const response = await request(app)
      .post(`/admin/pages/${childPageFirstID}/upload`)
      .attach('image', filePath);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not upload image ("Forbidden")', async () => {
    const response = await request(app)
      .post(`/admin/pages/${childPageFirstID}/upload`)
      .set('Authorization', `Bearer ${clientToken}`)
      .attach('image', filePath);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not upload image if page does not exist', async () => {
    const response = await request(app)
      .post(`/admin/pages/${NON_EXISTED_ID}/upload`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', filePath);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Page with such id (${NON_EXISTED_ID}) does not exist`
    );
  });

  it('should not upload image ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .post(`/admin/pages/${childPageFirstID}/upload`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', filePath);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

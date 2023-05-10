import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import { Database } from '../../../src/db';
import {
  expectedResponseTestData,
  requestTestData,
  NON_EXISTED_ID,
} from '../../test-constants';
import {
  createAdminUser,
  createClientUser,
  initUserEntities,
} from '../../test-utils';
import { TokenDTO } from '../../../src/dto';
import { app } from '../../../src/app';

const DB = new Database();

const {
  adminLoginData,
  clientRegisterDataTwo_AdminPath,
  clientRegisterDataThree_AdminPath,
  clientLoginData,
  invalidClientUpdateData,
  dataToFindAllUsers,
  wrongDataToFindAllUsers,
  dataToFindFilterUser,
  clientUpdateData_AdminPath,
} = requestTestData;

const { expectedResponseFindAllUsers } = expectedResponseTestData;

const {
  expectedResponseUser,
  expectedResponseUserTwo,
  expectedResponseUpdatedClientUser,
} = expectedResponseTestData;

let adminToken: TokenDTO;
let clientToken: TokenDTO;
let adminUserId: string;
let clientUserId: string;

beforeAll(async () => {
  await DB.connect();
  await DB.clear();
  await DB.synchronize();
});

afterAll(async () => {
  // await DB.clear();
  await DB.disconnect();
});

describe('POST /admin/users', () => {
  beforeAll(async () => {
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

  it('should create user by user with role=ADMIN (create userRole=USER only)', async () => {
    const response = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(clientRegisterDataTwo_AdminPath);
    expect(response.status).toEqual(201);
    expect(response.body).toMatchObject(expectedResponseUserTwo);
  });

  it('should not create duplicate user by user with role=ADMIN ("User...already exist")', async () => {
    const response = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(clientRegisterDataTwo_AdminPath);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty(
      'message',
      `User with email - ${clientRegisterDataTwo_AdminPath.email} already exists`
    );
  });

  it('should not create user by unauthorized user with role=ADMIN ("Unauthorized")', async () => {
    const response = await request(app)
      .post('/admin/users')
      .send(clientRegisterDataTwo_AdminPath);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not create user by user with role=USER ("Forbidden")', async () => {
    const response = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(clientRegisterDataThree_AdminPath);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not create user by user with role=USER ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .get('/public/auth/current-user')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('POST /admin/users/find', () => {
  beforeAll(async () => {
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

  it('should find all users by user with role=ADMIN', async () => {
    const response = await request(app)
      .post('/admin/users/find')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dataToFindAllUsers);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseFindAllUsers);
    expect(response.body.data[0]).toHaveProperty(
      'email',
      expect.stringMatching(/user@user.com|admin@admin.com/)
    );
    expect(response.body.data[1]).toHaveProperty(
      'lastName',
      expect.stringMatching(/Client|Admin/)
    );
  });

  it('should find users with "filter, sort, search" by user with role=ADMIN', async () => {
    const response = await request(app)
      .post('/admin/users/find')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dataToFindFilterUser);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseFindAllUsers);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty(
      'email',
      expect.stringMatching(/user@user.com/)
    );
  });

  it('should not find all users by user with role=ADMIN ("Invalid request")', async () => {
    const response = await request(app)
      .post('/admin/users/find')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(wrongDataToFindAllUsers);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not find all users by user with role=ADMIN ("Unauthorized")', async () => {
    const response = await request(app)
      .post('/admin/users/find')
      .send(dataToFindAllUsers);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not find all users by user with role=ADMIN ("Forbidden")', async () => {
    const response = await request(app)
      .post('/admin/users/find')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(dataToFindAllUsers);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not find all users by user with role=ADMIN ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .post('/admin/users/find')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(dataToFindAllUsers);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('GET /admin/users/:id', () => {
  beforeAll(async () => {
    const { _adminToken, _clientToken, _adminUserId, _clientUserId } =
      await initUserEntities();
    adminToken = _adminToken;
    clientToken = _clientToken;
    adminUserId = _adminUserId;
    clientUserId = _clientUserId;
  });

  it('should find user by ID (by user with role=ADMIN)', async () => {
    const response = await request(app)
      .get(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseUser);
    expect(response.body).toHaveProperty('id', `${clientUserId}`);
  });

  it('should not find user by ID (by user with role=ADMIN) ("Invalid request")', async () => {
    const response = await request(app)
      .get(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${'wrong-token'}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should find user by ID (by user with role=USER) ("Unauthorized")', async () => {
    const response = await request(app).get(`/admin/users/${clientUserId}`);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should find user by ID (by user with role=USER) ("Forbidden")', async () => {
    const response = await request(app)
      .get(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not find non-existed user by ID (by user with role=ADMIN)', async () => {
    const response = await request(app)
      .get(`/admin/users/${NON_EXISTED_ID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `User with id - ${NON_EXISTED_ID} does not exist`
    );
  });

  it('should not find user by ID (by user with role=ADMIN) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .get(`/admin/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('PATCH /admin/users/:id', () => {
  beforeAll(async () => {
    const { _adminToken, _clientToken, _adminUserId, _clientUserId } =
      await initUserEntities();
    adminToken = _adminToken;
    clientToken = _clientToken;
    adminUserId = _adminUserId;
    clientUserId = _clientUserId;
  });

  it('should update user by ID (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .patch(`/admin/users/${clientUserId}`)
      .send(clientUpdateData_AdminPath)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseUpdatedClientUser);
    expect(response.body).toHaveProperty(
      'email',
      `${expectedResponseUpdatedClientUser.email}`
    );
  });

  it('should not update user by ID (by user with role=ADMIN only) ("Invalid request")', async () => {
    const response = await request(app)
      .patch(`/admin/users/${clientUserId}`)
      .send(invalidClientUpdateData)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not update user by ID (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app)
      .patch(`/admin/users/${clientUserId}`)
      .send(clientUpdateData_AdminPath);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not update user by ID (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .patch(`/admin/users/${clientUserId}`)
      .send(clientUpdateData_AdminPath)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not update non-existed user by ID (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .patch(`/admin/users/${NON_EXISTED_ID}`)
      .send(clientUpdateData_AdminPath)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `User with id - ${NON_EXISTED_ID} does not exist`
    );
  });

  it('should not update user by ID (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .patch(`/admin/users/${clientUserId}`)
      .send(clientUpdateData_AdminPath)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('DELETE /admin/users/:id', () => {
  beforeAll(async () => {
    const { _adminToken, _clientToken, _adminUserId, _clientUserId } =
      await initUserEntities();
    adminToken = _adminToken;
    clientToken = _clientToken;
    adminUserId = _adminUserId;
    clientUserId = _clientUserId;
  });

  it('should not delete user by ID (by user with role=ADMIN only) ("Invalid request")', async () => {
    const response = await request(app)
      .delete(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${'wrong-token'}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not delete user by ID (by user with role=ADMIN only) ("Unauthorized")', async () => {
    const response = await request(app).delete(`/admin/users/${clientUserId}`);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not delete user by ID (by user with role=ADMIN only) ("Forbidden")', async () => {
    const response = await request(app)
      .delete(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not delete non-existed user by ID (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .delete(`/admin/users/${NON_EXISTED_ID}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `User with id - ${NON_EXISTED_ID} does not exist`
    );
  });

  it('should delete user by ID (by user with role=ADMIN only)', async () => {
    const response = await request(app)
      .delete(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('email', expectedResponseUser.email);
  });

  it('should not delete user by ID (by user with role=ADMIN only) ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .delete(`/admin/users/${clientUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

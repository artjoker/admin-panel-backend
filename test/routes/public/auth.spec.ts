import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import { Database } from '../../../src/db';
import {
  expectedResponseTestData,
  requestTestData,
  testData,
} from '../../test-constants';
import { createAdminUser, createClientUser } from '../../test-utils';
import { TokenDTO } from '../../../src/dto';
import { app } from '../../../src/app';

const DB = new Database();

const {
  clientLoginData,
  invalidLoginData,
  nonExistedLoginData,
  clientRegisterData_PublicPath,
  invalidRegisterData,
  duplicateRegisterData,
  clientUpdateData_PublicPath,
  invalidClientUpdateData,
} = requestTestData;

const { clientUser } = testData;

const {
  expectedResponseTokenDTO,
  expectedResponseUser,
  expectedResponseUpdatedClientUser,
} = expectedResponseTestData;

beforeAll(async () => {
  await DB.connect();
  await DB.clear();
  await DB.synchronize();
});

afterAll(async () => {
  await DB.clear();
  await DB.disconnect();
});

describe('POST /public/auth/register', () => {
  it('should register new user', async () => {
    const response = await request(app)
      .post('/public/auth/register')
      .send(clientRegisterData_PublicPath);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toMatchObject(expectedResponseTokenDTO);
  });

  it('should not register new user ("Invalid request")', async () => {
    const response = await request(app)
      .post('/public/auth/register')
      .send(invalidRegisterData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not register existing user', async () => {
    const response = await request(app)
      .post('/public/auth/register')
      .send(duplicateRegisterData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty(
      'message',
      `User with email - ${duplicateRegisterData.email} already exists`
    );
  });

  it('should not register new user ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .post('/public/auth/register')
      .send(clientRegisterData_PublicPath);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('POST /public/auth/login', () => {
  beforeAll(async () => {
    await createClientUser();
  });

  it('should login with userRole.ADMIN/USER', async () => {
    const response = await request(app)
      .post('/public/auth/login')
      .send(clientLoginData);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toMatchObject(expectedResponseTokenDTO);
  });

  it('should not login with invalid login data ("Invalid request")', async () => {
    const response = await request(app)
      .post('/public/auth/login')
      .send(invalidLoginData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not login with wrong password ("Wrong password")', async () => {
    clientLoginData.password = 'wrong-password';
    const response = await request(app)
      .post('/public/auth/login')
      .send(clientLoginData);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Wrong password');
    clientLoginData.password = clientUser.password;
  });

  it('should not found non-existed user in the DB', async () => {
    const response = await request(app)
      .post('/public/auth/login')
      .send(nonExistedLoginData);
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `User with email ${nonExistedLoginData.email} does not exist`
    );
  });

  it('should not login ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .post('/public/auth/login')
      .send(clientLoginData);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('GET /public/auth/current-user', () => {
  let token: TokenDTO;

  beforeAll(async () => {
    await createClientUser();
    const response = await request(app)
      .post('/public/auth/login')
      .send(clientLoginData);
    token = response.body.token;
  });

  it('should get current user', async () => {
    const response = await request(app)
      .get('/public/auth/current-user')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseUser);
  });

  it('should not get current user ("Invalid request")', async () => {
    const response = await request(app)
      .get('/public/auth/current-user')
      .set('Authorization', `Bearer ${'wrong-token'}`);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not get current user ("Unauthorized")', async () => {
    const response = await request(app).get('/public/auth/current-user');
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not get current user ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .get('/public/auth/current-user')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });

  it('should not get current user (does not exist)', async () => {
    const response = await request(app)
      .get('/public/auth/current-user')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(404);
    expect(response.body.message.endsWith('does not exist')).toBe(true);
  });
});

describe('PATCH /public/auth/update-user', () => {
  let token: TokenDTO;

  beforeAll(async () => {
    await createAdminUser();
    await createClientUser();
    const response = await request(app)
      .post('/public/auth/login')
      .send(clientLoginData);
    token = response.body.token;
  });

  it('should update ADMIN/USER user', async () => {
    const response = await request(app)
      .patch('/public/auth/update-user')
      .set('Authorization', `Bearer ${token}`)
      .send(clientUpdateData_PublicPath);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseUpdatedClientUser);
  });

  it('should not update ADMIN/USER user ("Invalid request")', async () => {
    const response = await request(app)
      .patch('/public/auth/update-user')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidClientUpdateData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not update ADMIN/USER user ("Unauthorized")', async () => {
    const response = await request(app)
      .patch('/public/auth/update-user')
      .send(clientUpdateData_PublicPath);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should not update ADMIN/USER user ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app)
      .patch('/public/auth/update-user')
      .set('Authorization', `Bearer ${token}`)
      .send(clientUpdateData_PublicPath);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });

  it('should not update ADMIN/USER user (does not exist)', async () => {
    const response = await request(app)
      .patch('/public/auth/update-user')
      .set('Authorization', `Bearer ${token}`)
      .send(clientUpdateData_PublicPath);
    expect(response.status).toEqual(404);
    expect(response.body.message.endsWith('does not exist')).toBe(true);
  });
});

import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import { Database } from '../../../src/db';
import {
  requestTestData,
  expectedResponseTestData,
  testData,
} from '../../test-constants';
import { createAdminUser, createClientUser } from '../../test-utils';
import { app } from '../../../src/app';

const DB = new Database();

const {
  adminLoginData,
  clientLoginData,
  invalidLoginData,
  nonExistedLoginData,
} = requestTestData;

const { expectedResponseTokenDTO } = expectedResponseTestData;
const { adminUser } = testData;

beforeAll(async () => {
  // await dataSource.query(`CREATE DATABASE my_database_555`);
  await DB.connect();
  await DB.clear();
  await DB.synchronize();
});

afterAll(async () => {
  await DB.clear();
  await DB.disconnect();
});

describe('POST /admin/auth/login', () => {
  beforeAll(async () => {
    await createAdminUser();
    await createClientUser();
  });

  it('should login with userRole.ADMIN', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
      .send(adminLoginData);
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toMatchObject(expectedResponseTokenDTO);
  });

  it('should not login with invalid login data ("Invalid request")', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
      .send(invalidLoginData);
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not login with wrong password ("Wrong password")', async () => {
    adminLoginData.password = 'wrong-password';
    const response = await request(app)
      .post('/admin/auth/login')
      .send(adminLoginData);
    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('message', 'Wrong password');
    adminLoginData.password = adminUser.password;
  });

  it('should not login with userRole.USER ("Forbidden")', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
      .send(clientLoginData);
    expect(response.status).toEqual(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  it('should not found non-existed user in the DB', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
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
      .post('/admin/auth/login')
      .send(adminLoginData);
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

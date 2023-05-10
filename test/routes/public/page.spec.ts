import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();
import { Database } from '../../../src/db';
import { initPageEntities } from '../../test-utils';
import {
  expectedResponseTestData,
  NON_EXISTED_SLUG,
} from '../../test-constants';
import { app } from '../../../src/app';

const DB = new Database();

const {
  expectedResponseAllPages_PublicPath,
  expectedResponseChildPage_PublicPath,
  expectedResponsePageChildren,
} = expectedResponseTestData;

let parentPageID: string;
let parentPageSlug: string;
let childPageFirstSlug: string;

beforeAll(async () => {
  await DB.connect();
  await DB.clear();
  await DB.synchronize();
});

afterAll(async () => {
  await DB.clear();
  await DB.disconnect();
});

describe('GET /public/pages/', () => {
  beforeAll(async () => {
    await initPageEntities();
  });

  it('should get all pages', async () => {
    const response = await request(app).get('/public/pages/');
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject([expectedResponseAllPages_PublicPath]);
    expect(response.body[0]).toHaveProperty('urlSlug', 'parent-page');
    expect(response.body[0].children[0]).toHaveProperty(
      'urlSlug',
      expect.stringMatching(/child-page-one|child-page-two/)
    );

    expect(response.body[0].children[1]).toHaveProperty(
      'urlSlug',
      expect.stringMatching(/child-page-one|child-page-two/)
    );
  });

  it('should not get all pages ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app).get('/public/pages/');
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('GET /public/pages/{slug}', () => {
  beforeAll(async () => {
    const { _parentPage, _childPageFirst } = await initPageEntities();
    parentPageID = _parentPage.id;
    parentPageSlug = _parentPage.urlSlug;
    childPageFirstSlug = _childPageFirst.urlSlug;
  });

  it('should get page by slug', async () => {
    const response = await request(app).get(
      `/public/pages/${childPageFirstSlug}`
    );
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponseChildPage_PublicPath);
    expect(response.body).toHaveProperty('urlSlug', 'child-page-one');
    expect(response.body.parent).toHaveProperty('id', parentPageID);
    expect(response.body.parent).toHaveProperty('urlSlug', 'parent-page');
  });

  it('should not get non-existed slug', async () => {
    const response = await request(app).get(
      `/public/pages/${NON_EXISTED_SLUG}`
    );
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Page with such slug: (${NON_EXISTED_SLUG}) does not exist`
    );
  });

  it('should not get page by slug ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app).get(
      `/public/pages/${childPageFirstSlug}`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

describe('GET /public/pages/{slug}/children', () => {
  beforeAll(async () => {
    const { _parentPage, _childPageFirst } = await initPageEntities();
    parentPageID = _parentPage.id;
    parentPageSlug = _parentPage.urlSlug;
    childPageFirstSlug = _childPageFirst.urlSlug;
  });

  it('should get page children without query params', async () => {
    const response = await request(app).get(
      `/public/pages/${parentPageSlug}/children`
    );
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(expectedResponsePageChildren);
    expect(response.body.data[0]).toHaveProperty(
      'urlSlug',
      expect.stringMatching(/child-page-one|child-page-two/)
    );

    expect(response.body.data[1]).toHaveProperty(
      'urlSlug',
      expect.stringMatching(/child-page-one|child-page-two/)
    );
  });

  it('should get page children with query params', async () => {
    const response = await request(app)
      .get(`/public/pages/${parentPageSlug}/children`)
      .query({ page: 1, perPage: 5 });
    expect(response.status).toEqual(200);
    expectedResponsePageChildren.perPage = 5;
    expect(response.body).toMatchObject(expectedResponsePageChildren);
    expect(response.body).toHaveProperty('perPage', 5);
    expect(response.body.data[0]).toHaveProperty(
      'urlSlug',
      expect.stringMatching(/child-page-one|child-page-two/)
    );
    expect(response.body.data[1]).toHaveProperty(
      'urlSlug',
      expect.stringMatching(/child-page-one|child-page-two/)
    );
  });

  it('should not get page children with wrong query params', async () => {
    const response = await request(app)
      .get(`/public/pages/${parentPageSlug}/children`)
      .query({ page: 1, perPage: 'дичь' });
    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('message', 'Invalid request');
  });

  it('should not get non-existed page', async () => {
    const response = await request(app).get(
      `/public/pages/${NON_EXISTED_SLUG}/children`
    );
    expect(response.status).toEqual(404);
    expect(response.body).toHaveProperty(
      'message',
      `Page with such slug: (${NON_EXISTED_SLUG}) does not exist`
    );
  });

  it('should not get page ("Internal server error")', async () => {
    await DB.drop();
    const response = await request(app).get(
      `/public/pages/${parentPageSlug}/children`
    );
    expect(response.status).toEqual(500);
    expect(response.body).toHaveProperty('message', 'Internal server error');
    await DB.synchronize();
  });
});

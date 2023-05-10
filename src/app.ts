import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import cors from 'cors';
import { routes } from './routes';
import { errorHandler } from './middlewares';
import * as swaggerUI from 'swagger-ui-express';
import * as swaggerJson from './openapi/openapi.json';

const app: Application = express();

app.use(cors());

app.use(
  express.json({
    limit: '50mb',
  }),
  express.urlencoded({
    limit: '50mb',
    extended: true,
  })
);

app.use(routes);

app.use(errorHandler);

app.use(['/api-docs'], swaggerUI.serve, swaggerUI.setup(swaggerJson));

export { app };

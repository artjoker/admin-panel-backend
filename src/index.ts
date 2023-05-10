import dotenv from 'dotenv';
dotenv.config();
import { config } from './constants/config';
import { app } from './app';
import { Database } from './db';
import dataSource from './app-data-source';
import { User } from './entities';
import { UserService } from './services';

const port = config.PORT;

const DB = new Database();

(async () => {
  await DB.connect();
  await DB.synchronize();

  const userService = new UserService({ isPublicApi: false });
  const adminUser = await dataSource
    .getRepository(User)
    .findOneBy({ email: config.ADMIN_CREDS.email });

  if (!adminUser) {
    await userService.createUser(config.ADMIN_CREDS);
  }
})();

app.listen(port, () => {
  console.log(`🖥️  Server is running at http://localhost:${port}`);
  console.log(`📚 Documentation: http://localhost:${port}/api-docs`);
});

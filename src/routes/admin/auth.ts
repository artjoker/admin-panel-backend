import { Router } from 'express';

import { AuthController } from '../../controllers';

const authController = new AuthController({ isPublicApi: false });

const router = Router();

router.post('/login', authController.login);

export { router as authRoutes };

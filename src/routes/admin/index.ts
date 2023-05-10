import { Router } from 'express';
import { authRoutes } from './auth';
import { userRoutes } from './user';
import { pageRoutes } from './page';

import { AuthController } from '../../controllers';

const authController = new AuthController({ isPublicApi: false });

const router = Router();

router.use('/pages', authController.authMiddleware, pageRoutes);

router.use('/users', authController.authMiddleware, userRoutes);

router.use('/auth', authRoutes);

export { router as adminRoutes };

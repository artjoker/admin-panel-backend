import { Router } from 'express';

import { AuthController, UserController } from '../../controllers';

const authController = new AuthController({ isPublicApi: true });
const userController = new UserController({ isPublicApi: true });

const router = Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get(
  '/current-user',
  authController.authMiddleware,
  userController.getCurrentUser
);

router.patch(
  '/update-user',
  authController.authMiddleware,
  userController.updateCurrentUser
);

export { router as authRoutes };

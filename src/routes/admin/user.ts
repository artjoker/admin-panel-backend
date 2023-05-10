import { Router } from 'express';

import { UserController } from '../../controllers';

const userController = new UserController({ isPublicApi: false });

const router = Router();

router.post('/find', userController.findUsers);

router.get('/:id', userController.getUserById);

router.post('/', userController.createUser);

router.patch('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

export { router as userRoutes };

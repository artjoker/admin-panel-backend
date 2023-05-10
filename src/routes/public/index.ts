import { Router } from 'express';
import { authRoutes } from './auth';
import { pageRoutes } from './page';

const router = Router();

router.use('/auth', authRoutes);

router.use('/pages', pageRoutes);

export { router as publicRoutes };

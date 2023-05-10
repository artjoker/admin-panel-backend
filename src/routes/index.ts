import express, { Router } from 'express';
import { adminRoutes } from './admin';
import { publicRoutes } from './public';

const router = Router();

router.use('/storage', express.static('storage'));
router.use('/admin', adminRoutes);

router.use('/public', publicRoutes);

export { router as routes };

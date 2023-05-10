import { Router } from 'express';

import { PageController } from '../../controllers';

const pageController = new PageController({ isPublicApi: true });

const router = Router();

router.get('/', pageController.getRoutes);

router.get('/:slug', pageController.getPageBySlug);

router.get('/:slug/children', pageController.getPageChildren);

export { router as pageRoutes };

import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import { PageController } from '../../controllers';

const pageController = new PageController({ isPublicApi: false });

const router = Router();

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    fs.mkdir('./storage/', { recursive: true }, (err: any) => {
      callback(null, './storage/');
      if (err) {
        console.error('upload folder could not be created');
        throw err;
      }
    });
  },
  filename(_req, file, callback) {
    const fileName = `${Date.now()}${file.originalname}`;
    callback(null, fileName);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const upload = multer({ storage, limits });

router.get('/', pageController.getPages);

router.post('/', pageController.createPage);

router.get('/:pageId', pageController.getPageById);

router.patch('/:pageId', pageController.updatePage);

router.delete('/:pageId', pageController.deletePage);

router.post(
  '/:pageId/upload',
  pageController.checkPageExist,
  upload.single('image'),
  pageController.uploadImage
);

export { router as pageRoutes };

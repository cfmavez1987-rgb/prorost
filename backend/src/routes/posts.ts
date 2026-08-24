import { Router } from 'express';
import * as postsController from '../controllers/postsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPost);
router.post('/', postsController.createPost);
router.patch('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);
router.post('/:id/schedule', postsController.schedulePost);

export default router;

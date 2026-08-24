import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/overview', analyticsController.getOverview);
router.get('/posts/:id', analyticsController.getPostAnalytics);
router.get('/reach', analyticsController.getReachDynamics);

export default router;

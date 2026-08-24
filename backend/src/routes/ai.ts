import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/generate', aiController.generatePost);

export default router;

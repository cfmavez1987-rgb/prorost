import { Router } from 'express';
import * as socialController from '../controllers/socialController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', socialController.getAccounts);
router.get('/connect/:provider', socialController.connectAccount);
router.delete('/:id', socialController.disconnectAccount);

export default router;

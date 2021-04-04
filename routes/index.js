import express from 'express';
import master from './master';
import masterJwtMiddleware from '../lib/masterJwtMiddleware';

const router = express.Router();

router.use(masterJwtMiddleware);
router.use('/master', master);

export default router;

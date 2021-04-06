import express from 'express';
import main from './main';
import master from './master';
import masterJwtMiddleware from '../lib/masterJwtMiddleware';

const router = express.Router();

router.use('/main', main);
router.use(masterJwtMiddleware);
router.use('/master', master);

export default router;

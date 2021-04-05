import express from 'express';
import main from './main';
import master from './master';

const router = express.Router();

router.use('/main', main);
router.use('/master', master);

export default router;

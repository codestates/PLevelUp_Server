import express from 'express';
import master from './master';

const router = express.Router();

router.use('/master', master);

export default router;

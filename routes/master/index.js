import express from 'express';
import club from './club';
import auth from './auth';

const router = express.Router();

router.use('/auth', auth);
router.use('/club', club);

export default router;

import express from 'express';
import auth from './auth';
import club from './club';

const router = express.Router();

router.use('/auth', auth);
router.use('/club', club);
export default router;

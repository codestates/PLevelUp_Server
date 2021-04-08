import express from 'express';
import club from './club';
import auth from './auth';
import masterCheckLoggedIn from '../../lib/masterCheckLoggerdIn';

const router = express.Router();

router.use('/auth', auth);
router.use(masterCheckLoggedIn);
router.use('/club', club);

export default router;

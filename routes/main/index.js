import express from 'express';
import auth from './auth';
import club from './club';
import payment from './payment';

const router = express.Router();

router.use('/auth', auth);
router.use('/club', club);
router.use('/payment', payment);
export default router;

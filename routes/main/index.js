import express from 'express';
import auth from './auth';
import club from './club';
import passportConfig from '../../passport';

const router = express.Router();

passportConfig.userPassport();
router.use('/auth', auth);
router.use('/club', club);
export default router;

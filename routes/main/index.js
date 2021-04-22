import express from 'express';
import auth from './auth';
import club from './club';
import payment from './payment';
import passportConfig from '../../passport';
import controller from '../../controllers/main';
const router = express.Router();

passportConfig.userPassport();
router.use('/auth', auth);
router.use('/club', club);
router.use('/payment', payment);
router.get('/landinglist', controller.landingList);
export default router;

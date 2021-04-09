import express from 'express';
import controller from '../../controllers/main/auth';

const router = express.Router();

router.post('/sign-up', controller.signup);
router.post('/login', controller.login);
router.get('/is-login', controller.isLogin);
router.post('/logout', controller.logout);
export default router;

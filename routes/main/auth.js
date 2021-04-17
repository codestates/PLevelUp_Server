import express from 'express';
import controller from '../../controllers/main/auth';

const router = express.Router();

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/islogin', controller.isLogin);
router.post('/logout', controller.logout);
router.post('/update', controller.update);
export default router;

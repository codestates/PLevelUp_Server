import controller from '../../controllers/master/auth.js';

import express from 'express';
const router = express.Router();

router.post('/signup', controller.signUp);
router.post('/login', controller.login);
router.get('/islogin', controller.isLogin);
router.post('/logout', controller.logout);

export default router;

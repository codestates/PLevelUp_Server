import express from 'express';
import controller from '../../controllers/main/auth';
import passport from 'passport';

const router = express.Router();

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/login/kakao', passport.authenticate('kakao'));
router.get('/login/kakao/callback', controller.loginKakao);
router.get(
  '/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);
router.get('/login/google/callback', controller.loginGoogle);
router.get('/islogin', controller.isLogin);
router.post('/logout', controller.logout);
router.post('/changepassword', controller.changePassword);
export default router;

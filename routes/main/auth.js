import express from 'express';
import controller from '../../controllers/main/auth';

const router = express.Router();

router.post('/login', controller.login);
router.post('/signup', controller.signup);
router.get('/check', controller.check);
router.post('/logout', controller.logout);
export default router;

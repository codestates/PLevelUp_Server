import express from 'express';
import controller from '../../controllers/main/payment';

const router = express.Router();

router.get('/history', controller.read);
export default router;

import express from 'express';
import controller from '../../controllers/main/payment';

const router = express.Router();

router.post('/complete', controller.pay);
export default router;

import express from 'express';
import controller from '../../controllers/master/club';

const router = express.Router();

router.get('/', controller.list);

export default router;

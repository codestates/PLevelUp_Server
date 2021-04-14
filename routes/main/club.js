import express from 'express';
import controller from '../../controllers/main/club';

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.read);

export default router;

import express from 'express';
import controller from '../../controllers/master/club';

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.write);
router.get('/:id', controller.read);
router.delete('/:id', controller.remove);
router.patch('/:id', controller.update);

export default router;

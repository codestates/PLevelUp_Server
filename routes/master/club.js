import express from 'express';
import controller, { getClubsById } from '../../controllers/master/club';

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.write);
router.get('/:id', getClubsById, controller.read);
router.delete('/:id', getClubsById, controller.remove);
router.patch('/:id', getClubsById, controller.update);

export default router;

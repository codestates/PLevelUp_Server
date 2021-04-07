import express from 'express';
import controller, { checkClubsId } from '../../controllers/master/club';

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.write);
router.get('/:id', checkClubsId, controller.read);
router.delete('/:id', checkClubsId, controller.remove);
router.patch('/:id', checkClubsId, controller.update);

export default router;

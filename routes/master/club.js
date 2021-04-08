import express from 'express';
import controller, {
  checkOwnClub,
  getClubsById,
} from '../../controllers/master/club';

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.write);
router.get('/:id', getClubsById, checkOwnClub, controller.read);
router.delete('/:id', getClubsById, checkOwnClub, controller.remove);
router.patch('/:id', getClubsById, checkOwnClub, controller.update);

export default router;

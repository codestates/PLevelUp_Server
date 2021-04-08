import express from 'express';
import controller, {
  checkOwnClub,
  getClubById,
} from '../../controllers/master/club';

const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.write);
router.get('/:id', getClubById, checkOwnClub, controller.read);
router.delete('/:id', getClubById, checkOwnClub, controller.remove);
router.patch('/:id', getClubById, checkOwnClub, controller.update);

export default router;

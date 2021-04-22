import express from 'express';
import controller from '../../controllers/main/club';
import mainCheckLoggedIn from '../../lib/mainCheckLoggedIn';

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.read);
router.post('/:id/payment', controller.pay);
router.post('/getbookmark', mainCheckLoggedIn, controller.getbookmark);
router.post(
  '/updatebookmark/:clubId',
  mainCheckLoggedIn,
  controller.updateBookmark,
);

export default router;

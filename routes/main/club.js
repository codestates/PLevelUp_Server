import express from 'express';
import controller from '../../controllers/main/club';
import mainCheckLoggedIn from '../../lib/mainCheckLoggedIn';

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.read);

router.post('/getbookmark', mainCheckLoggedIn, controller.getbookmark);

router.post('/addbookmark/:clubId', mainCheckLoggedIn, controller.addbookmark);
router.delete(
  '/removebookmark/:clubId',
  mainCheckLoggedIn,
  controller.removebookmark,
);
export default router;

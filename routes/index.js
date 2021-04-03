import express from 'express';
import controller from '../controllers';
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('Hello Carrots!');
});

router.get('/list', controller.list);

export default router;

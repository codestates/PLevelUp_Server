const express = require('express');
const router = express.Router();
const controller = require('../controllers');

router.get('/', (req, res) => {
  res.status(200).send('Hello Carrots!');
});

router.get('/list', controller.list);
module.exports = router;

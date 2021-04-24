import express from 'express';
import club from './club';
import auth from './auth';
import masterCheckLoggedIn from '../../lib/masterCheckLoggedIn';
import multer from 'multer';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import { SERVER_HOST } from '../../app';
import * as AWS from 'aws-sdk';

const router = express.Router();

router.use('/auth', auth);

router.use(masterCheckLoggedIn);
router.use('/club', club);

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

if (process.env.NODE_ENV === 'production') {
  AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
  });

  const upload = multer({
    storage: multerS3({
      s3: new AWS.S3(),
      bucket: 'p-levelup-client',
      key(req, file, cb) {
        cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  router.post('/img', upload.single('img'), (req, res) => {
    try {
      res.json({ url: req.file.location });
    } catch (e) {
      console.log(e.toString());
      res.status(500).send(e.toString());
    }
  });
} else {
  const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, 'uploads/');
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  router.post('/img', upload.single('img'), (req, res) => {
    try {
      res.json({ url: `${SERVER_HOST}/img/${req.file.filename}` });
    } catch (e) {
      console.log(e.toString());
      res.status(500).send(e.toString());
    }
  });
}

export default router;

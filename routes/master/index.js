import express from 'express';
import club from './club';
import auth from './auth';
import masterCheckLoggedIn from '../../lib/masterCheckLoggedIn';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

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
  res.json({ url: `/img/${req.file.filename}` });
});

export default router;

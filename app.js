require('dotenv').config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { sequelize } from './models';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes';

const app = express();
const { PORT, COOKIE_SECRET } = process.env;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch(err => {
    if (err.original.sqlState === '42000') {
      console.log('데이터 베이스가 없습니다.');
      console.log('npm run create:db');
      console.log('를 입력해주세요.');
    } else {
      console.error(err);
    }
  });

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTION', 'DELETE'],
    credentials: true,
  }),
);
// 서버는 '/' 가 필요없지만 임시 페이지 작성함
app.get('/', (req, res) => {
  res.status(200).send('Hello Carrots!');
});

app.use('/api', routes);

const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server start at http://localhost:${port}`);
});

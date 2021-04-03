require('dotenv').config();

import express from 'express';
import { sequelize } from './models';
import morgan from 'morgan';
import cors from 'cors';
import indexRouter from './routes';

const app = express();
const { PORT } = process.env;

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

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTION', 'DELETE'],
    credentials: true,
  }),
);

app.use('/', indexRouter);
const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server start at http://localhost:${port}`);
});

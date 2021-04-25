import express from 'express';
import cookieParser from 'cookie-parser';
import { sequelize } from './models';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes';
import {
  createDefaultMaster,
  createDummyClubData,
  createDummyClubDataForTest,
} from './createDummyData';
import jwtMiddleware from './lib/jwtMiddleware';
import path from 'path';
import dotenv from 'dotenv';
import passport from 'passport';

dotenv.config();
const app = express();
const { PORT, COOKIE_SECRET, NODE_ENV, HOST } = process.env;

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
    if (NODE_ENV === 'development') {
      createDefaultMaster()
        .then(masterId => {
          console.log('테스트 클럽장 계정 추가 완료');
          return createDummyClubData(masterId).then(_ =>
            createDummyClubDataForTest(masterId).then(_ =>
              console.log('테스트 club 데이터 추가 완료'),
            ),
          );
        })
        .catch(e => {
          if (e.errors[0].message === 'masters.email must be unique') {
            console.log('테스트 클럽장 계정이 이미 적용 되어 있음');
            return;
          }
          console.log(e.toString());
        });
    }
  })
  .catch(err => {
    if (err.original.sqlState === '42000') {
      console.log('데이터 베이스가 없습니다.');
      console.log('npm run db:create');
      console.log('를 입력해주세요.');
    } else {
      console.error(err);
    }
  });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

export const CLIENT_HOST =
  NODE_ENV === 'production' ? 'https://p-levelup.com' : `${HOST}:3000`;
app.use(
  cors({
    origin: CLIENT_HOST,
    exposedHeaders: ['last-page'],
    credentials: true,
  }),
);

app.use(passport.initialize());
app.use(jwtMiddleware);

// 서버는 '/' 가 필요없지만 임시 페이지 작성함
app.get('/', (req, res) => {
  res.status(200).send('Hello Carrots!');
});

app.use('/api', routes);
const port = PORT || 5000;
export const SERVER_HOST =
  NODE_ENV === 'production' ? 'https://api.p-levelup.com' : `${HOST}:${port}`;
app.listen(port, () => {
  console.log(`Server start at ${SERVER_HOST}`);
});

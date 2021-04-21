import Joi from 'joi';
import User from '../../models/user';
import bcrypt from 'bcrypt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { generateToken } from '../../common/utils';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export default {
  //회원가입
  signup: async (req, res) => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      username: Joi.string().min(2).max(15).required(),
      password: Joi.string().min(6).required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
    const { email, username, password } = req.body;
    try {
      // email 이미 존재하는지 확인
      const exists = await User.findByEmail(email);
      if (exists) {
        res.sendStatus(409); // Conflict
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        email: email,
        username: username,
        password: hashedPassword,
      });
      const user = await User.findByEmail(email);

      req.login(user, { session: false }, error => {
        if (error) next(error);
        const access_token = generateToken(
          user.id,
          user.email,
          user.username,
          user.type,
        );
        const data = user.serialize();
        return res
          .cookie('access_token', access_token, {
            maxAge: 1000 * 60 * 60 * 24 * 1,
            httpOnly: true,
          })
          .status(200)
          .json(data);
      });
    } catch (e) {
      res.status(500).json(e.toString());
    }
  },
  //로그인
  login: async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user) => {
      if (err || !user) return res.sendStatus(401);
      req.login(user, { session: false }, error => {
        if (error) next(error);
        const access_token = generateToken(
          user.id,
          user.email,
          user.username,
          user.type,
        );
        const data = user.serialize();
        return res
          .cookie('access_token', access_token, {
            maxAge: 1000 * 60 * 60 * 24 * 1,
            httpOnly: true,
          })
          .status(200)
          .json(data);
      });
    })(req, res, next);
  },
  loginKakao: async (req, res, next) => {
    passport.authenticate('kakao', { session: false }, (err, user) => {
      if (err || !user) return res.sendStatus(401);
      req.login(user, { session: false }, error => {
        if (error) {
          next(error);
        }
        const access_token = generateToken(
          user.snsId,
          user.email,
          user.displayName,
          user.type,
        );

        const data = user.serialize();
        return res
          .cookie('access_token', access_token, {
            maxAge: 1000 * 60 * 60 * 24 * 1,
            httpOnly: true,
          })
          .status(200)
          .json(data);
      });
    })(req, res, next);
  },
  loginGoogle: async (req, res, next) => {
    passport.authenticate(
      'google',
      { session: false, failureRedirect: '/api/main/auth/login' },
      (err, user) => {
        if (err || !user) return res.sendStatus(401);
        req.login(user, { session: false }, error => {
          if (error) {
            next(error);
          }
          const access_token = generateToken(
            user.snsId,
            user.email,
            user.displayName,
            user.type,
          );
          const data = user.serialize();
          return res
            .cookie('access_token', access_token, {
              maxAge: 1000 * 60 * 60 * 24 * 1,
              httpOnly: true,
            })
            .status(200)
            .json(data);
        });
      },
    )(req, res, next);
  },
  //로그인 상태확인
  isLogin: async (req, res) => {
    console.log('qwerqwer', res.user);
    const { user } = res;
    if (!user) {
      // 로그인 중 아님
      res.sendStatus(401); // Unauthorized
      return;
    }
    res.status(200).json(user);
  },
  //로그아웃
  logout: async (req, res) => {
    req.logout();
    res.clearCookie('access_token').sendStatus(204); // No Content
  },
  //비밀번호변경
  changePassword: async (req, res) => {
    const { password, changePassword } = req.body;

    if (!password || !changePassword) {
      return res.sendStatus(400);
    }
    try {
      const user = await User.findByEmail(res.user.email);

      if (!user) {
        return res.sendStatus(401);
      }

      const isValid = await user.checkPassword(password);
      if (!isValid) {
        res.sendStatus(401);
        return;
      }

      const hashedPassword = await bcrypt.hash(req.body.changePassword, 10);
      await user.update({
        password: hashedPassword,
        updatedAt: new Date(),
      });
      const data = user.serialize();
      const token = user.generateToken();
      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      });
      res.status(200).send(data);
    } catch (e) {
      res.status(500).json(e.toString());
    }
  },
  findPassword: async (req, res) => {
    const { email } = req.body;
    try {
      //임시비밀번호 생성
      const temporaryPassword = Math.random().toString(36).slice(2);

      //임시비밀번호로 변경
      const user = await User.findByEmail(email);
      if (!user) {
        res.status(401).send('해당 이메일로 가입된 계정이 존재하지 않습니다.');
      }
      const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 10);
      await user.update({
        password: hashedTemporaryPassword,
        updateAt: new Date(),
      });

      //메일발송 함수
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        prot: 587,
        host: 'smtp.gmail.com',
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.GMAIL_ADDRESS,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      //메일옵션
      const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: email,
        subject: '[P`Levelup]임시 비밀번호 발급 안내',
        text: `  안녕하세요. P-LevelUp 입니다. ${user.username}님에게 발급된 임시 비밀번호는 [${temporaryPassword}]입니다. 로그인 후 마이페이지를 통해 비밀번호를 변경하여 사용하실 수 있습니다.`,
      };

      //메일 발송
      const mail = await transporter.sendMail(mailOptions);
      res.status(200).json(mail);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
};

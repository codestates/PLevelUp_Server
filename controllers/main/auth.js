import Joi from 'joi';
import User from '../../models/user';
import bcrypt from 'bcrypt';
import models from '../../models';
import { Sequelize } from 'sequelize';

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
  //로그인
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.sendStatus(401);
    }
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        res.sendStatus(401);
        return;
      }
      const isValid = await user.checkPassword(password);
      if (!isValid) {
        res.sendStatus(401);
        return;
      }
      const data = user.serialize();
      const token = user.generateToken();
      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      });
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  //로그인 상태확인
  isLogin: async (req, res) => {
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
};

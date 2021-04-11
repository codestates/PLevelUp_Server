import Joi from 'joi';
import bcrypt from 'bcrypt';
import models from '../../models';
import { Sequelize } from 'sequelize';
const { User } = models;

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
    try {
      const exists = await User.findOne({
        where: { email: req.body.email },
      });
      if (exists) {
        return res.status(409).send();
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        email: req.body.email,
        password: hashedPassword,
        username: req.body.username,
      });
      const user = await User.findByEmail(req.body.email);
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
      res.status(500).json(e.toString());
    }
  },
  //로그인 상태확인
  isLogin: async (req, res) => {
    const { user } = res;
    try {
      if (!user) {
        console.log('user not exist'); //* 삭제예정
        // user가 없다면 jwt검증에서 유저가 없는 것 = 로그인 중 아님
        return res.status(401).send();
      }
      console.log(user); //* 삭제예정
      res.status(200).json(user);
    } catch (e) {
      res.status(400).json(e.toString());
    }
  },
  //로그아웃
  logout: async (req, res) => {
    try {
      res.clearCookie('access_token');
      res.status(204).json({ message: 'logout is successed' });
    } catch (e) {
      res.status.json(e.toString());
    }
  },

  //비밀번호변경
  update: async (req, res) => {
    const { email, password, changePassword } = req.body;
    if (!email | !password | !changePassword) {
      return res.sendStatus(401);
    }
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.sendStatus(401).json({ message: 'User does not exsit' });
      }
      await user.update({
        password: changePassword,
        updatedAt: Sequelize.fn('NOW'),
      });
      console.log(user);
      res.status(200).json({ message: 'Password successfully changed' });
    } catch (e) {
      res.status.json(e.toString());
    }
  },
};

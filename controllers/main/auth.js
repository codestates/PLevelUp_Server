import tokenFunction from '../tokenFunction';
const { generateAccessToken, sendAccessToken } = tokenFunction;
import models from '../../models';
const { User } = models;
import bcrypt from 'bcrypt';

export default {
  //회원가입
  signup: async (req, res) => {
    try {
      const exists = await User.findOne({
        where: { email: req.body.email },
      });
      if (exists) {
        return res.status(409).send();
      }
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      await User.create({
        email: req.body.email,
        password: hashPassword,
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
    } catch (err) {
      res.status(500).json({ message: err.toString() });
    }
  },
  //로그인
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.sendStatus(401);
    }
    try {
      await User.findOne({
        where: { email, password },
      });
      const user = await User.findByEmail(req.body.email);
      const data = user.serialize();
      const token = user.generateToken();
      res.cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      });
      res.status(200).send(data);
    } catch (err) {
      res.status(500).json({ message: err + '!' });
    }
  },
  //로그인 상태확인
  check: async (req, res) => {
    const { user } = res;
    try {
      if (!user) {
        console.log('user not exist');
        // user가 없다면 jwt검증에서 유저가 없는 것 = 로그인 중 아님
        return res.status(401).send();
      }
      console.log(user);
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: err + '!' });
    }
  },
  //로그아웃
  logout: async (req, res) => {
    try {
      res.clearCookie('access_token');
      res.status(200).json({ message: 'logout is successed' });
    } catch (err) {
      res.status.json({ message: err + '!' });
    }
  },
};

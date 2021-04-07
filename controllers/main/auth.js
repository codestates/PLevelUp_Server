import tokenFunction from '../tokenFunction';
const { generateAccessToken, sendAccessToken } = tokenFunction;
import models from '../../models';
const { User } = models;

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
      const userData = await User.create({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
      });
      const accessToken = generateAccessToken(userData.dataValues);
      sendAccessToken(res, accessToken);
    } catch (err) {
      res.status(500).json({ message: err + '!' });
    }
  },
  //로그인
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).send();
    }
    try {
      await User.findOne({
        where: { email, password },
      }).then(userData => {
        if (!userData) {
          return res.status(401).send();
        }

        delete userData.dataValues.password;
        const accessToken = generateAccessToken(userData.dataValues); //email
        sendAccessToken(res, accessToken);
      });
    } catch (err) {
      res.status(500).json({ message: err + '!' });
    }
  },
  //로그인 상태확인
  check: async (req, res) => {
    console.log('check here');
    const { user } = res;
    try {
      if (!user) {
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

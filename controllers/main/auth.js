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
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
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
    try {
      const { email, password } = req.body;
      await User.findOne({
        where: { email, password },
      }).then(userData => {
        if (!userData) {
          return res
            .status(401)
            .json({ message: 'Invalid user or Wrong password' });
        }

        delete userData.dataValues.password;
        const accessToken = generateAccessToken(userData.dataValues);
        sendAccessToken(res, accessToken);
      });
    } catch (err) {
      res.status(500).json({ message: err + '!' });
    }
  },
};

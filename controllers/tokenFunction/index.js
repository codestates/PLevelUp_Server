import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export default {
  // access토큰 발급
  generateAccessToken: data => {
    return jwt.sign(data, process.env.ACCESS_SECRET, { expiresIn: '1H' });
  },

  // access토큰 보내기
  sendAccessToken: (res, accessToken) => {
    res.status(200).json({ accessToken, message: 'AccessToken is issued' });
  },

  // access토큰 있는지 확인해서 있으면 verify
  isAuthorized: req => {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      return res
        .status(401)
        .json({ data: null, message: 'you have not authorization' });
    }
    const accessToken = authorization.split(' ')[1];

    try {
      return jwt.verify(accessToken, process.env.ACCESS_SECRET);
    } catch (err) {
      // return null if invalid token
      return res
        .status(401)
        .json({ data: null, message: 'invalid access token' });
    }
  },
};

import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export default {
  // access토큰 발급
  generateAccessToken: data => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1H' });
  },

  // access토큰 보내기
  sendAccessToken: (res, accessToken) => {
    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
    res.status(200).json({ message: 'AccessToken is issued' });
  },

  // access토큰 있는지 확인해서 있으면 verify
  isAuthorized: (req, res) => {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      return res
        .status(401)
        .json({ data: null, message: 'Authorization error' });
    }

    try {
      return jwt.verify(accessToken, process.env.ACCESS_SECRET);
    } catch (err) {
      // return null if invalid token
      return res
        .status(401)
        .json({ data: null, message: 'Invalid accesstoken error' });
    }
  },
};

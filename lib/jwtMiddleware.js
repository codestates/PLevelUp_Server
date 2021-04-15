import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Master from '../models/master';
import User from '../models/user';

dotenv.config();

export default async function jwtMiddleware(req, res, next) {
  if (!req.cookies) return next();

  // 로그아웃시 cookie 삭제하므로 둘 다 있을 상황은 없다.
  const masterToken = req.cookies['master_access_token'];
  const userToken = req.cookies['access_token'];

  if (!masterToken && !userToken) return next();

  try {
    if (masterToken) {
      res.master = null;
      const masterDecoded = jwt.verify(masterToken, process.env.JWT_SECRET);
      res.master = {
        _id: masterDecoded._id,
        email: masterDecoded.email,
      };
      const now = Math.floor(Date.now() / 1000);

      if (masterDecoded.exp - now < 60 * 60 * 6) {
        const master = await Master.findOne({
          where: { id: masterDecoded._id },
        });
        const token = master.generateToken();
        res.cookies.set('master_access_token', token, {
          maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
          httpOnly: true,
        });
      }
    } else if (userToken) {
      res.user = null;
      const userDecoded = jwt.verify(userToken, process.env.JWT_SECRET);
      res.user = {
        _id: userDecoded._id,
        email: userDecoded.email,
        username: userDecoded.username,
      };
      const now = Math.floor(Date.now() / 1000);

      if (userDecoded.exp - now < 60 * 60 * 6) {
        const user = await User.findOne({ where: { id: userDecoded._id } });
        const token = user.generateToken();
        res.cookies.set('access_token', token, {
          maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
          httpOnly: true,
        });
      }
    }
    return next();
  } catch (err) {
    return next();
  }
}

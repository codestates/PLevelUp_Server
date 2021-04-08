import jwt from 'jsonwebtoken';
import Master from '../models/master';

export default async function masterJwtMiddleware(req, res, next) {
  const token = req.cookies['master_access_token'];
  if (!token) return next();

  try {
    res.master = null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.master = {
      _id: decoded._id,
      email: decoded.email,
    };
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp - now < 60 * 60 * 6) {
      const master = await Master.findOne({ where: { id: decoded._id } });
      const token = master.generateToken();
      res.cookies.set('master_access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      });
    }
    return next();
  } catch (e) {
    return next();
  }
}

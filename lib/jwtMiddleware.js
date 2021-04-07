import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const jwtMiddleware = (req, res, next) => {
  console.log('CookiesCheck');
  if (!req.cookies) {
    console.log('No Cookies');
    return next();
  }
  const token = req.cookies.access_token;
  console.log('token: ' + token);
  console.log(process.env.JWT_SECRET);
  if (!token) return next(); //토큰없음 (회원가입, 로그인 api)
  try {
    //토큰있음 (재방문,새로고침, 다른api요청시)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.user = {
      _id: decoded.id,
      email: decoded.email,
    };
    console.log(decoded);
    console.log(res.user);
    return next();
  } catch (err) {
    console.log(err);
    return next();
  }
};

export default jwtMiddleware;

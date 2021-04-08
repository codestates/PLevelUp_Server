import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const jwtMiddleware = (req, res, next) => {
  if (!req.cookies) {
    return next();
  }
  const token = req.cookies.access_token;
  if (!token) return next(); //토큰없음 (회원가입, 로그인 api)
  try {
    //토큰있음 (재방문,새로고침, 다른api요청시)
    res.user = null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.user = {
      _id: decoded._id,
      email: decoded.email,
    };
    console.log(decoded); //* 삭제예정
    console.log(res.user); //* 삭제예정
    return next();
  } catch (err) {
    console.log('At jwtMiddleware' + err); //* 삭제예정
    return next();
  }
};

export default jwtMiddleware;

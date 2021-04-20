import jwt from 'jsonwebtoken';

export const generateToken = (id, email, username, type) => {
  return jwt.sign(
    {
      id: id,
      email: email,
      username: username,
      type: type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );
};
const week = ['일', '월', '화', '수', '목', '금', '토'];
export const getDayOfWeek = date => week[new Date(date).getDay()];

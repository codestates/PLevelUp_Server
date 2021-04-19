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

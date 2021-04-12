import Joi from 'joi';
import Master from '../../models/master';
import bcrypt from 'bcrypt';

export default {
  signUp: async (req, res) => {
    // Request Body 검증하기
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      username: Joi.string().min(2).max(15).required(),
      password: Joi.string().min(6).required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }

    const { email, username, password } = req.body;
    try {
      // email 이미 존재하는지 확인
      const exists = await Master.findByEmail(email);
      if (exists) {
        res.sendStatus(409); // Conflict일
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await Master.create({
        email: email,
        username: username,
        password: hashedPassword,
      });

      const master = await Master.findByEmail(email);
      const data = master.serialize();
      const token = master.generateToken();
      res
        .status(200)
        .cookie('master_access_token', token, {
          maxAge: 1000 * 60 * 60 * 24 * 1,
          httpOnly: true,
        })
        .send(data);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    // email, password 가 없으면 에러 처리
    if (!email || !password) {
      res.sendStatus(401); // Unauthorized
      return;
    }

    try {
      const master = await Master.findByEmail(email);

      // 계정이 존재하지 않으면 에러 처리
      if (!master) {
        res.sendStatus(401); // Unauthorized
        return;
      }

      const valid = await master.checkPassword(password);

      // 잘못된 비밀번호
      if (!valid) {
        res.sendStatus(401); // Unauthorized
        return;
      }
      const data = master.serialize();
      const token = master.generateToken();

      res
        .status(200)
        .cookie('master_access_token', token, {
          maxAge: 1000 * 60 * 60 * 24 * 1, // 1일
         httpOnly: true,
        })
        .send(data);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  isLogin: (req, res) => {
    const { master } = res;
    if (!master) {
      // 로그인 중 아님
      res.sendStatus(401); // Unauthorized
      return;
    }
    res.status(200).send(master);
  },
  logout: (req, res) => {
    res.clearCookie('master_access_token').sendStatus(204); // No Content
  },
};

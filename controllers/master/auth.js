import Joi from 'joi';
import Master from '../../models/master';
import bcrypt from 'bcrypt';

export default {
  signUp: async (req, res) => {
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
      const exists = await Master.findByEmail(email);
      if (exists) {
        res.sendStatus(409);
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
    if (!email || !password) {
      res.sendStatus(401);
      return;
    }
    try {
      const master = await Master.findByEmail(email);

      if (!master) {
        res.sendStatus(401);
        return;
      }
      const valid = await master.checkPassword(password);
      if (!valid) {
        res.sendStatus(401);
        return;
      }
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
  isLogin: (req, res) => {
    const { master } = res;
    if (!master) {
      res.sendStatus(401);
      return;
    }
    res.status(200).send(master);
  },
  logout: (req, res) => {
    res.clearCookie('master_access_token').sendStatus(204);
  },
};

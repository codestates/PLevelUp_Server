import Joi from 'joi';
import Master from '../../models/master';
import bcrypt from 'bcrypt';

export default {
  signUp: async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      username: Joi.string().min(2).max(15).required(),
      password: Joi.string().min(8).required(),
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
      const hashPassword = await bcrypt.hash(password, 10);
      await Master.create({
        email: email,
        username: username,
        password: hashPassword,
      });

      const master = await Master.findByEmail(email);
      const data = master.serialize();
      const token = await master.generateToken();
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
    }
    const master = await Master.findByEmail(email);

    if (!master) {
      res.sendStatus(401);
    }
    const valid = master.checkPassword(password);
    if (!valid) {
      res.sendStatus(401);
    }
    const data = master.serialize();
    const token = await master.generateToken();
    res
      .status(200)
      .cookie('master_access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      })
      .send(data);
  },
  isLogin: (req, res) => {
    res.status(200).send('this is master isLogin');
  },
  logout: (req, res) => {
    res.status(200).send('this is master logout');
  },
};

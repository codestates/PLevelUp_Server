import Club from '../../models/club';
import Joi from 'joi';

export const checkClubsId = async (req, res, next) => {
  const { id } = req.params;
  const exists = await Club.count({ where: { id: id } });
  if (exists === 0) {
    res.sendStatus(400);
    return;
  }
  return next();
};
export default {
  write: async (req, res) => {
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      summary: Joi.string().required(),
      place: Joi.string().required(),
      price: Joi.number().required(),
      description: Joi.string().required(),
      topic: Joi.string().required(),
      startDate: Joi.date().required(),
      endData: Joi.date().required(),
      day: Joi.string().required(),
      limitUserNumber: Joi.number().required(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
    const {
      title,
      summary,
      place,
      price,
      description,
      topic,
      startDate,
      endDate,
      day,
      limitUserNumber,
    } = req.body;

    try {
      const club = await Club.create({
        title: title,
        summary: summary,
        place: place,
        price: price,
        description: description,
        topic: topic,
        startDate: startDate,
        endDate: endDate,
        day: day,
        limitUserNumber: limitUserNumber,
      });
      res.status(200).send(club);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  list: async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    if (page < 1) {
      res.sendStatus(400);
      return;
    }
    try {
      const clubs = await Club.findAll({
        limit: 20,
        order: [['id', 'DESC']],
        offset: (page - 1) * 10,
      });
      res.status(200).send(clubs);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  read: async (req, res) => {
    const { id } = req.params;
    try {
      const club = await Club.findOne({ where: { id: id } });
      if (!club) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(club);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  remove: async (req, res) => {
    const { id } = req.params;
    try {
      await Club.destroy({ where: { id: id } });
      res.sendStatus(204);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  update: async (req, res) => {
    const { id } = req.params;
    const schema = Joi.object().keys({
      title: Joi.string(),
      summary: Joi.string(),
      place: Joi.string(),
      price: Joi.number(),
      description: Joi.string(),
      topic: Joi.string(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      day: Joi.string(),
      limitUserNumber: Joi.number(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
    try {
      await Club.update(req.body, {
        where: {
          id: id,
        },
      });
      const club = await Club.findOne({ where: { id: id } });
      if (!club) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(club);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
};

import Club from '../../models/club';
import Joi from 'joi';

export const getClubById = async (req, res, next) => {
  const { id } = req.params;
  const exists = await Club.count({ where: { id: id } });
  if (exists === 0) {
    res.sendStatus(400);
    return;
  }
  try {
    const club = await Club.findOne({ where: { id: id } });
    if (!club) {
      club.status = 404;
      return;
    }
    res.masterClub = club;
    return next();
  } catch (e) {
    res.status(500).send(e.toString());
  }
};

export const checkOwnClub = (req, res, next) => {
  const master = res.master,
    club = res.masterClub;
  if (club.MasterId.toString() !== master._id) {
    res.sendStatus(403);
    return;
  }
  return next();
};
const clubListEllipsis = (text, limit) =>
  text.length < limit ? text : `${text.slice(0, limit)}...`;
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
      endDate: Joi.date().required(),
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
        MasterId: res.master._id,
      });
      club.updatedAt = null
      res.status(200).send(club);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  list: async (req, res) => {
    const perPage = 20;
    const page = parseInt(req.query.page || '1', 10);
    if (page < 1) {
      res.sendStatus(400);
      return;
    }
    try {
      const clubs = await Club.findAll({
        limit: perPage,
        order: [['id', 'DESC']],
        offset: (page - 1) * 10,
      });
      const clubsCount = await Club.count();
      res.set('last-page', Math.ceil(clubsCount / perPage));
      const data = clubs
        .map(club => club.toJSON())
        .map(club => {
          return {
            ...club,
            summary: clubListEllipsis(club.summary, 50),
            description: clubListEllipsis(club.description, 50),
            topic: clubListEllipsis((club.topic, 50)),
          };
        });
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  read: async (req, res) => {
    res.status(200).send(res.masterClub);
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

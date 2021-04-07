import Club from '../../models/club';
import Joi from 'joi';

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
    } else {
      console.log(result);
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
  list: (req, res) => {},
  read: (req, res) => {},
  remove: (req, res) => {},
  update: (req, res) => {},
};

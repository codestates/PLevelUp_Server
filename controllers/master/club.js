import Club from '../../models/club';
import Joi from 'joi';
import Master from '../../models/master';
import sanitizeHtml from 'sanitize-html';
import {
  checkDateVsNow,
  checkEnd,
  clubListEllipsis,
  getDayOfWeek,
} from '../../common/utils';
import { sequelize } from '../../models';
const { Apply } = sequelize.models;

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
    'em',
    'strong',
    'u',
    's',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src'],
    li: ['class'],
  },
  allowedSchemes: ['data', 'http'],
};

export const getClubById = async (req, res, next) => {
  const { id } = req.params;
  const exists = await Club.count({ where: { id: id } });
  if (exists === 0) {
    res.sendStatus(400); // Bad Request
    return;
  }

  try {
    const club = await Club.findOne({
      include: [
        {
          model: Master,
          attributes: ['id', 'email', 'username'],
        },
      ],
      where: { id: id },
    });

    if (!club) {
      club.status = 404; // Not Found
      return;
    }
    res.masterClub = club;
    return next();
  } catch (e) {
    res.status(500).send(e.toString());
  }
};

export const checkOwnClub = (req, res, next) => {
  // id 로 찾은 클럽이 로그인 중인 마스터가 작성한 클럽인지 확인
  const master = res.master,
    club = res.masterClub;
  if (club.MasterId.toString() !== master.id.toString()) {
    res.sendStatus(403); // Forbidden
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
      startDate: Joi.date().required(),
      times: Joi.number().required(),
      // day: Joi.string().required(),
      limitUserNumber: Joi.number().required(),
      coverUrl: Joi.string().required(),
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
      startDate,
      times,
      //day,
      limitUserNumber,
      coverUrl,
    } = req.body;
    const day = getDayOfWeek(startDate);
    try {
      const club = await Club.create({
        title: title,
        summary: summary,
        place: place,
        price: price,
        description: sanitizeHtml(description, sanitizeOption),
        startDate: startDate,
        times: times,
        day: day,
        limitUserNumber: limitUserNumber,
        MasterId: res.master.id,
        coverUrl: coverUrl,
      });
      club.updatedAt = null;
      res.status(200).send(club);
    } catch (e) {
      console.log(e.toString());
      res.status(500).send(e.toString());
    }
  },
  list: async (req, res) => {
    // 한페이지에 몇개씩 ?
    const perPage = 12;

    const { master } = res;

    const page = parseInt(req.query.page || '1', 10);
    if (page < 1) {
      res.sendStatus(400);
      return;
    }

    const conditions = {
      limit: perPage,
      order: [['id', 'DESC']],
      offset: (page - 1) * perPage,
      include: [
        {
          model: Master,
          attributes: ['id', 'email', 'username'],
        },
      ],
      where: { MasterId: master.id },
    };

    try {
      const clubs = await Club.findAll(conditions);
      const clubsCount = await Club.count(conditions);

      // 헤더에 last-page 같이 보내줌
      res.set('last-page', Math.ceil(clubsCount / perPage));
      const data = clubs
        .map(club => club.toJSON())
        .map(club => {
          const currentUserNumber = Apply.count({
            where: { ClubId: club.id },
          });

          return {
            ...club,
            description: clubListEllipsis(club.description, -1),
            isOnline: club.place === '온라인',
            isNew: checkDateVsNow(club.createdAt, true) < 7,
            isMostStart:
              0 < checkDateVsNow(club.startDate, false) < 7 ||
              club.limitUserNumber <= currentUserNumber + 3,
            isStart:
              (checkDateVsNow(club.startDate, false) < 0 &&
                !checkEnd(club.startDate, club.times)) ||
              club.limitUserNumber <= currentUserNumber,
            isEnd: checkEnd(club.startDate, club.times),
            isFourLimitNumber: club.limitUserNumber === 4,
          };
        })
        .map(club => {
          if (club.isStart && club.isMostStart) {
            club.isMostStart = false;
          }
          return club;
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
      res.sendStatus(204); // No Content
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
      startDate: Joi.date(),
      times: Joi.number(),
      // day: Joi.string(),
      limitUserNumber: Joi.number(),
      coverUrl: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
    const nextData = { ...req.body, updatedAt: new Date() }; // 객체를 복사하고

    if (nextData.description) {
      nextData.description = sanitizeHtml(nextData.description, sanitizeOption);
    }

    if (nextData.startDate) {
      nextData.day = getDayOfWeek(req.body.startDate);
    }

    try {
      await Club.update(nextData, {
        where: {
          id: id,
        },
      });
      const club = await Club.findOne({ where: { id: id } });

      if (!club) {
        res.sendStatus(404); // Not Found
        return;
      }
      res.status(200).send(club);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
};

import Club from '../../models/club';
import Joi from 'joi';
import Master from '../../models/master';
import sanitizeHtml from 'sanitize-html';

const sanitizeOption = {
  allowedTags: [
    'h1',
    'h2',
    'b',
    'i',
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
  if (club.MasterId.toString() !== master._id.toString()) {
    res.sendStatus(403); // Forbidden
    return;
  }
  return next();
};
// html을 없애고 내용이 너무 길면 limit으로 제한하는 함수 (limit -1 일 경우 제한 x)
const clubListEllipsis = (body, limit) => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < limit || limit === -1
    ? filtered
    : `${filtered.slice(0, limit)}...`;
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
      endDate: Joi.date().required(),
      day: Joi.string().required(),
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
      endDate,
      day,
      limitUserNumber,
      coverUrl,
    } = req.body;

    try {
      const club = await Club.create({
        title: title,
        summary: summary,
        place: place,
        price: price,
        description: sanitizeHtml(description, sanitizeOption),
        startDate: startDate,
        endDate: endDate,
        day: day,
        limitUserNumber: limitUserNumber,
        MasterId: res.master._id,
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
    try {
      const clubs = await Club.findAll({
        limit: perPage,
        order: [['id', 'DESC']],
        offset: (page - 1) * perPage,
        where: { MasterId: master._id },
        include: [
          {
            model: Master,
            attributes: ['id', 'email', 'username'],
          },
        ],
      });
      const clubsCount = await Club.count();

      // 헤더에 last-page 같이 보내줌
      res.set('last-page', Math.ceil(clubsCount / perPage));
      const data = clubs
        .map(club => club.toJSON())
        .map(club => {
          return {
            ...club,
            summary: clubListEllipsis(club.summary, 50),
            description: clubListEllipsis(club.description, -1),
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
      endDate: Joi.date(),
      day: Joi.string(),
      limitUserNumber: Joi.number(),
      coverUrl: Joi.string().required(),
    });

    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
      return;
    }
    const nextData = { ...req.body, updatedAt: new Date() }; // 객체를 복사하고

    // body 값이 주여졌으면 HTML 필터링
    if (nextData.summary) {
      nextData.summary = sanitizeHtml(nextData.summary, sanitizeOption);
    }

    if (nextData.description) {
      nextData.description = sanitizeHtml(nextData.description, sanitizeOption);
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

import Club from '../../models/club';
import Master from '../../models/master';
import sanitizeHtml from 'sanitize-html';

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
  list: async (req, res) => {
    // 한페이지에 몇개씩 ?
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
        offset: (page - 1) * perPage,
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
            topic: clubListEllipsis(club.topic, 50),
          };
        });
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  read: async (req, res) => {
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
      res.status(200).send(res.masterClub);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
};

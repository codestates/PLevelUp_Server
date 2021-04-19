import Club from '../../models/club';
import Master from '../../models/master';
import sanitizeHtml from 'sanitize-html';
import db from '../../models/index';
import { Op } from 'sequelize';

// html을 없애고 내용이 너무 길면 limit으로 제한하는 함수 (limit -1 일 경우 제한 x)
const clubListEllipsis = (body, limit) => {
  const filtered = sanitizeHtml(body, {
    allowedTags: [],
  });
  return filtered.length < limit || limit === -1
    ? filtered
    : `${filtered.slice(0, limit)}...`;
};
const { Bookmark } = db.sequelize.models;

export default {
  list: async (req, res) => {
    // 한페이지에 몇개씩 ?
    const perPage = 12;

    const page = parseInt(req.query.page || '1', 10);
    if (page < 1) {
      res.sendStatus(400);
      return;
    }
    const userId = res.user ? res.user.id : null;

    const conditions = {
      limit: perPage,
      order: [['id', 'DESC']],
      offset: (page - 1) * perPage,
      include: [
        {
          model: Master,
          attributes: ['id', 'email', 'username'],
        },
        {
          model: Bookmark,
          attributes: ['UserId'],
          required: false,
          where: {
            UserId: userId,
          },
        },
      ],
    };

    if (req.query.search) {
      conditions.where = {
        title: {
          [Op.like]: '%' + req.query.search + '%',
        },
      };
    }

    try {
      const clubs = await Club.findAll(conditions);
      const clubsCount = await Club.count(conditions);
      // 헤더에 last-page 같이 보내줌
      res.set('last-page', Math.ceil(clubsCount / perPage));
      const data = clubs
        .map(club => club.toJSON())
        .map(club => {
          return {
            ...club,
            description: clubListEllipsis(club.description, -1),
            isBookmark: club.Bookmarked.length === 1 ? true : false,
          };
        })
        .map(club => {
          delete club.Bookmarked;
          return club;
        });
      res.status(200).send(data);
    } catch (e) {
      console.error(`main club list error: ${e.toString()}`);
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
          {
            model: Bookmark,
            attributes: ['UserId'],
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
  addbookmark: async (req, res) => {
    // POST /api/main/club/bookmark/1
    try {
      const { user } = res; // 로그인한 user를 가져옴
      const { clubId } = req.params;
      const club = await Club.findOne({ where: { id: clubId } }); // 북마크요청된 클럽을 가져옴
      if (!club) {
        res.status(403).send('클럽이 존재하지 않습니다.');
      }
      await club.addBookmarkers(user.id);
      res.status(200).send({ ClubId: club.id, UserId: user.id });
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  removebookmark: async (req, res) => {
    // DELETE /api/main/club/bookmark/1
    try {
      const { user } = res;
      const { clubId } = req.params;
      const club = await Club.findOne({ where: { id: clubId } });
      if (!club) {
        res.status(403).send('클럽이 존재하지 않습니다.');
      }
      await club.removeBookmarkers(user.id);
      res.status(200).json({ ClubId: club.id, UserId: user.id });
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  getbookmark: async (req, res) => {
    try {
      const { user } = res;
      const ClubList = await Club.findAll({
        include: {
          model: Bookmark,
          attributes: [],
          where: { userId: user.id },
        },
      });
      res.status(200).send(ClubList);
    } catch (e) {
      console.log(e);
      res.status(500).send(e.toString());
    }
  },
};

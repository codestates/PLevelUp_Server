import Master from '../../models/master';
import { Op } from 'sequelize';
import Club from '../../models/club';
import { checkDateVsNow, deepCopy } from '../../common/utils';
import { sequelize } from '../../models';
const { Bookmark } = sequelize.models;
export default {
  landingList: async (req, res) => {
    // 한페이지에 몇개씩 ?
    const perPage = 6;

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

    const onlineConditions = deepCopy(conditions);
    onlineConditions.where = {
      place: '온라인',
    };

    const isNewConditions = deepCopy(conditions);
    isNewConditions.where = {
      createdAt: {
        [Op.gt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        [Op.lt]: new Date().toISOString(),
      },
    };

    const isMostEndConditions = deepCopy(conditions);
    isMostEndConditions.where = {
      startdate: {
        [Op.gt]: new Date().toISOString(),
        [Op.lt]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };

    const isFourLimitConditions = deepCopy(conditions);
    isFourLimitConditions.where = {
      limitUserNumber: 4,
    };

    try {
      const clubsList = [];

      clubsList.push(await Club.findAll(onlineConditions));
      clubsList.push(await Club.findAll(isNewConditions));
      clubsList.push(await Club.findAll(isMostEndConditions));
      clubsList.push(await Club.findAll(isFourLimitConditions));

      const data = clubsList.map(clubs =>
        clubs
          .map(club => club.toJSON())
          .map(club => {
            return {
              ...club,
              isBookmark: club.Bookmarked.length === 1,
              isOnline: club.place === '온라인',
              isNew: checkDateVsNow(club.startDate, true) < 7,
              isMostEnd: checkDateVsNow(club.endDate, false) < 7,
              isEnd: checkDateVsNow(club.endDate, false) < 0,
              isFourLimitNumber: club.limitUserNumber === 4,
            };
          })
          .map(club => {
            delete club.Bookmarked;
            delete club.description;
            return club;
          }),
      );
      res.status(200).json({
        onlineList: data[0],
        newList: data[1],
        mostEndList: data[2],
        fourLimitList: data[3],
      });
    } catch (e) {
      console.error(`main landing list error: ${e.toString()}`);
      res.status(500).send(e.toString());
    }
  },
};

import Master from '../../models/master';
import { Op } from 'sequelize';
import Club from '../../models/club';
import { checkDateVsNow, checkEnd, deepCopy } from '../../common/utils';
import { sequelize } from '../../models';

const { Bookmark } = sequelize.models;
const { Apply } = sequelize.models;

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
        {
          model: Apply,
          attributes: ['UserId'],
          required: false,
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

    const gangnamConditions = deepCopy(conditions);
    gangnamConditions.where = {
      place: '강남',
    };

    const isFourLimitConditions = deepCopy(conditions);
    isFourLimitConditions.where = {
      limitUserNumber: 4,
    };

    try {
      const clubsList = [];

      clubsList.push(await Club.findAll(onlineConditions));
      clubsList.push(await Club.findAll(isNewConditions));
      clubsList.push(await Club.findAll(gangnamConditions));
      clubsList.push(await Club.findAll(isFourLimitConditions));

      const data = clubsList.map(clubs =>
        clubs
          .map(club => club.toJSON())
          .map(club => {
            return {
              ...club,
              currentUserNumber: club.ApplyUser.length,
            };
          })
          .map(club => {
            return {
              ...club,
              isBookmark: club.Bookmarked.length === 1,
              isOnline: club.place === '온라인',
              isNew: checkDateVsNow(club.createdAt, true) < 7,
              isMostStart:
                (0 < checkDateVsNow(club.startDate, false) &&
                  checkDateVsNow(club.startDate, false) < 7) ||
                club.limitUserNumber <= club.currentUserNumber + 3,
              isStart:
                (checkDateVsNow(club.startDate, false) < 0 &&
                  !checkEnd(club.startDate, club.times)) ||
                club.limitUserNumber <= club.currentUserNumber,
              isEnd: checkEnd(club.startDate, club.times),
              isFourLimitNumber: club.limitUserNumber === 4,
            };
          })
          .map(club => {
            delete club.Bookmarked;
            delete club.ApplyUser;
            delete club.description;
            if (club.isStart && club.isMostStart) {
              club.isMostStart = false;
            }
            return club;
          }),
      );
      res.status(200).json({
        onlineList: data[0],
        newList: data[1],
        gangnamList: data[2],
        fourLimitList: data[3],
      });
    } catch (e) {
      console.error(`main landing list error: ${e.toString()}`);
      res.status(500).send(e.toString());
    }
  },
};

import Club from '../../models/club';
import User from '../../models/user';
import Master from '../../models/master';
import PaymentLog from '../../models/paymentLog';
import axios from 'axios';
import { Op } from 'sequelize';
import { sequelize } from '../../models';
import { checkDateVsNow, checkEnd, clubListEllipsis } from '../../common/utils';

const { Bookmark } = sequelize.models;
const { Apply } = sequelize.models;
// html을 없애고 내용이 너무 길면 limit으로 제한하는 함수 (limit -1 일 경우 제한 x)

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
        {
          model: Apply,
          attributes: ['UserId'],
          required: false,
        },
      ],
    };

    const where = {};

    if (req.query.search) {
      where.title = {
        [Op.like]: '%' + req.query.search + '%',
      };
    }

    if (req.query.place) {
      if (req.query.place === '오프라인') {
        where.place = { [Op.not]: '온라인' };
      } else {
        where.place = req.query.place;
      }
    }

    if (req.query.day) {
      where.day = req.query.day;
    }
    if (req.query.limitNumber) {
      if (req.query.limitNumber === '7') {
        where.limitUserNumber = {
          [Op.gt]: parseInt(req.query.limitNumber, 10),
        };
      } else {
        where.limitUserNumber = parseInt(req.query.limitNumber, 10);
      }
    }
    if (req.query.filter) {
      if (req.query.filter === 'isNew') {
        where.createdAt = {
          [Op.gt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          [Op.lt]: new Date().toISOString(),
        };
      }
    }

    conditions.where = where;

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
            currentUserNumber: club.ApplyUser.length,
          };
        })
        .map(club => {
          return {
            ...club,
            description: clubListEllipsis(club.description, -1),
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
          if (club.isStart && club.isMostStart) {
            club.isMostStart = false;
          }
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
    const userId = res.user ? res.user.id : null;

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
            required: false,
            where: {
              UserId: userId,
            },
          },
        ],
        where: { id: id },
      });

      if (!club) {
        club.status = 404; // Not Found
        return;
      }
      const currentUserNumber = await Apply.count({ where: { ClubId: id } });
      const data = club.toJSON();
      data.isBookmark = club.Bookmarked.length === 1;
      data.isNew = checkDateVsNow(club.createdAt, true) < 7;
      data.isMostStart =
        (0 < checkDateVsNow(club.startDate, false) &&
          checkDateVsNow(club.startDate, false) < 7) ||
        club.limitUserNumber <= currentUserNumber + 3;
      data.isStart =
        (checkDateVsNow(club.startDate, false) < 0 &&
          !checkEnd(club.startDate, club.times)) ||
        club.limitUserNumber <= currentUserNumber;
      data.isEnd = checkEnd(club.startDate, club.times);
      data.isFourLimitNumber = club.limitUserNumber === 4;
      data.currentUserNumber = currentUserNumber;
      delete data.Bookmarked;
      if (data.isStart && data.isMostStart) {
        data.isMostStart = false;
      }

      res.status(200).send(data);
    } catch (e) {
      res.status(500).send(e.toString());
    }
  },
  updateBookmark: async (req, res) => {
    try {
      const { user } = res; // 로그인한 user를 가져옴
      const { clubId } = req.params;

      const club = await Club.findOne({ where: { id: clubId } }); // 북마크요청된 클럽을 가져옴
      if (!club) {
        res.status(403).send('클럽이 존재하지 않습니다.');
      }

      const { isBookmark } = req.body;
      if (!isBookmark && isBookmark !== false) {
        res.sendStatus(400);
      }

      if (isBookmark) {
        await club.addBookmarkers(user.id);
      } else {
        await club.removeBookmarkers(user.id);
      }

      res.status(200).send({ clubId: club.id, userId: user.id, isBookmark });
    } catch (e) {
      console.log(e);
      res.status(500).send(e.toString());
    }
  },
  getbookmark: async (req, res) => {
    try {
      const userId = res.user ? res.user.id : null;
      const clubList = await Club.findAll({
        include: [
          {
            model: Master,
            attributes: ['id', 'email', 'username'],
          },
          {
            model: Bookmark,
            attributes: ['UserId'],
            // required: false,
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
      });

      const data = clubList
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
            description: clubListEllipsis(club.description, -1),
            isBookmark: club.Bookmarked.length === 1,
            isOnline: club.place === '온라인',
            isNew: checkDateVsNow(club.createdAt, true) < 7,
            isMostStart:
              checkDateVsNow(club.startDate, false) > 0 &&
              checkDateVsNow(club.startDate, false) < 7,
            isStart: checkDateVsNow(club.startDate, false) < 0,
            isEnd: checkEnd(club.startDate, club.times),
            isFourLimitNumber: club.limitUserNumber === 4,
          };
        })
        .map(club => {
          delete club.Bookmarked;
          delete club.ApplyUser;
          if (club.isStart && club.isMostStart) {
            club.isMostStart = false;
          }
          return club;
        });

      res.status(200).send(data);
    } catch (e) {
      console.log(e);
      res.status(500).send(e.toString());
    }
  },

  pay: async (req, res) => {
    try {
      const { imp_uid, merchant_uid } = req.body;

      const getToken = await axios.post(
        'https://api.iamport.kr/users/getToken',
        {
          imp_key: process.env.IAMPORT_REST_API,
          imp_secret: process.env.IAMPORT_REST_API_SECRET,
        },
        { 'Content-Type': 'application/json' },
      );

      const { access_token } = getToken.data.response;

      const getPaymentData = await axios.get(
        `https://api.iamport.kr/payments/${imp_uid}`,
        {
          headers: {
            Authorization: access_token,
          },
        },
      );

      const paymentData = getPaymentData.data.response;

      const order = await Club.findOne({
        where: { id: paymentData.custom_data },
      });

      const clubsCount = await Club.count({
        where: { id: paymentData.custom_data },
      });

      const { limitUserNumber } = order;

      if (clubsCount >= limitUserNumber) {
        res.status(400).send('This club is all booked up!');
        return;
      }

      const amountToBePaid = order.price;

      const { amount, status, buyer_email, name, custom_data } = paymentData;
      const user = await User.findByEmail(buyer_email);

      if (amount === amountToBePaid) {
        await PaymentLog.create({
          status: status,
          title: name,
          price: amount,
          ClubId: order.id,
          UserId: user.id,
          merchantUid: merchant_uid,
        });

        const club = await Club.findOne({
          where: { id: custom_data },
        });

        await club.addApplyClub(user.id);
        await user.addApplyUser(club.id);

        res.status(200).send(paymentData);
        return;
      } else {
        throw { status: 'forgery', message: '위조된 결제시도' };
      }
    } catch (e) {
      res.status(400).send(e.toString());
    }
  },
};

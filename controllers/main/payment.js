import PaymentLog from '../../models/paymentLog';

export default {
  read: async (req, res) => {
    try {
      const { user } = res;
      const paymentLog = await PaymentLog.findAll({
        where: { UserId: user.id },
      });
      if (!paymentLog) {
        res.status(403).send('결제한 클럽이 존재하지 않습니다.');
      }
      res.status(200).send(paymentLog);
    } catch (e) {
      res.status(400).send(e.toString());
    }
  },
};

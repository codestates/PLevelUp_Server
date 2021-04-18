import Club from '../../models/club';
import PaymentLog from '../../models/paymentLog';
import User from '../../models/user';

export default {
  pay: async (req, res) => {
    try {
      const { imp_uid, merchant_uid } = req.body;
      const getToken = await axios.post(
        'https://api.iamport.kr/users/getToken',
        {
          imp_key: process.env.REST_API,
          imp_secret: process.env.REST_API_SECRET,
        },
        { 'Content-Type': 'application/json' },
      );
      //아임포트에서 발급 받은 인증 토큰
      const { access_token } = getToken.data.response;

      //imp_uid로 아임포트 서버에서 결제 정보 조회
      const getPaymentData = await axios.get(
        `https://api.iamport.kr/payments/${imp_uid}`,
        {
          headers: {
            Authorization: access_token,
          },
        },
      );

      const paymentData = getPaymentData.data.response; // 조회한 결제 정보

      //우리 DB에서 결제되어야 하는 금액 조회
      const order = await Club.findOne({
        where: { id: paymentData.merchant_uid },
      });
      const amountToBePaid = order.price; // 결제 되어야 하는 금액

      const { amount, status, buyer_email } = paymentData;
      const user = await User.findByEmail(buyer_email);

      if (amount === amountToBePaid) {
        // 결제 금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
        await PaymentLog.create({
          status: status,
          price: amount,
          clubId: merchant_uid, //이거는 같이쌓아줘야하는건지 모르겠습니다!
          userId: user._id,
        }); // DB에 결제 정보 저장
        res.status(200).send(paymentData);
        return;
      } else {
        // 결제 금액 불일치. 위/변조 된 결제
        throw { status: 'forgery', message: '위조된 결제시도' };
      }
    } catch (e) {
      res.status(400).send(e.toString());
    }
  },
};

//아임포트 페이지에서 토큰인증하고 GET /payments/{imp_uid}하면 성공적으로 응답받는 response
// {
//   "code": 0,
//   "message": null,
//   "response": {
//     "amount": 1000,
//     "apply_num": "47405704",
//     "bank_code": null,
//     "bank_name": null,
//     "buyer_addr": null,
//     "buyer_email": "brie@carrot.com",
//     "buyer_name": null,
//     "buyer_postcode": null,
//     "buyer_tel": null,
//     "cancel_amount": 0,
//     "cancel_history": [],
//     "cancel_reason": null,
//     "cancel_receipt_urls": [],
//     "cancelled_at": 0,
//     "card_code": "366",
//     "card_name": "신한카드",
//     "card_number": "510737*********6",
//     "card_quota": 0,
//     "card_type": 1,
//     "cash_receipt_issued": false,
//     "channel": "pc",
//     "currency": "KRW",
//     "custom_data": null,
//     "customer_uid": null,
//     "customer_uid_usage": null,
//     "escrow": false,
//     "fail_reason": null,
//     "failed_at": 0,
//     "imp_uid": "imp_401076007673",
//     "merchant_uid": "87",
//     "name": "클럽86",
//     "paid_at": 1618692096,
//     "pay_method": "card",
//     "pg_id": "INIpayTest",
//     "pg_provider": "html5_inicis",
//     "pg_tid": "StdpayCARDINIpayTest20210418054135849372",
//     "receipt_url": "https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayCARDINIpayTest20210418054135849372&noMethod=1",
//     "started_at": 1618692076,
//     "status": "paid",
//     "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
//     "vbank_code": null,
//     "vbank_date": 0,
//     "vbank_holder": null,
//     "vbank_issued_at": 0,
//     "vbank_name": null,
//     "vbank_num": null
//   }
// }

import passport from 'passport';
const KakaoStrategy = require('passport-kakao').Strategy;
import User from '../models/user';

export default function PassPortKakaoStrategy() {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_REST_API_KEY,
        callbackURL: '/api/main/auth/login/kakao/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, type: 'kakao' },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account.email,
              username: profile._json && profile._json.properties.nickname,
              password: '',
              type: 'kakao',
              snsId: profile.id,
            });
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      },
    ),
  );
}

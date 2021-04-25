import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import User from '../models/user';

const GoogleStrategy = passportGoogle.Strategy;

export default function PassPortGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, // OAuth 클라이언트 ID
        clientSecret: process.env.GOOGLE_SECRET_KEY, // 위에서 같이 생성된 비밀번호
        callbackURL: '/api/main/auth/login/google/callback', // 콜백 URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, type: 'google' },
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await User.create({
              email: profile._json.email,
              username: profile.displayName,
              type: 'google',
              password: '',
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

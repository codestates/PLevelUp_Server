import passport from 'passport';
import User from '../models/user';
import passportLocal from 'passport-local';
import Master from '../models/master';
import bcrypt from 'bcrypt';

const LocalStrategy = passportLocal.Strategy;

export default function PassPortLocalStrategy(isUser) {
  const model = isUser ? User : Master;
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await model.findByEmail(email);
          if (!user) return done(null, false);

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return done(null, false);
          return done(null, user);
        } catch (e) {
          done(e);
        }
      },
    ),
  );
}

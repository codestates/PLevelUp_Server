import PassPortKakaoStrategy from './kakaoStrategy';
import PassPortLocalStrategy from './localStrategy';
import PassPortGoogleStrategy from './googleStrategy';

const userPassport = () => {
  PassPortLocalStrategy(true);
  PassPortKakaoStrategy();
  PassPortGoogleStrategy();
};

const masterPassport = () => {
  PassPortLocalStrategy(false);
};

export default {
  userPassport: userPassport,
  masterPassport: masterPassport,
};

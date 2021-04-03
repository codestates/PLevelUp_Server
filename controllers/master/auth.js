export default {
  signUp: (req, res) => {
    res.status(200).send('this is master signUp');
  },
  login: (req, res) => {
    res.status(200).send('this is master login');
  },
  isLogin: (req, res) => {
    res.status(200).send('this is master isLogin');
  },
  logout: (req, res) => {
    res.status(200).send('this is master logout');
  },
};

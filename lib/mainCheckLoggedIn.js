export default function mainCheckLoggedIn(req, res, next) {
  if (!res.user) {
    res.sendStatus(401).send('로그인이 필요합니다.');
    return;
  }
  return next();
}

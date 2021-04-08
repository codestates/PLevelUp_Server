export default function masterCheckLoggedIn(req, res, next) {
  if (!res.master) {
    res.sendStatus(401);
    return;
  }
  return next();
}

module.exports = function verifierAuth(req, res, next) {
  req.user = { id: 0, role: 'client' };
  next();
};
module.exports = function verifierAuth(req, res, next) {
  req.user = { id: 0, role: 'client' };
}
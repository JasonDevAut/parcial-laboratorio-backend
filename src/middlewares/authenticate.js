const { AppError } = require('../lib/http');
const { verificar } = require('../lib/token');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'No autenticado'));
    return;
  }

  try {
    req.usuario = verificar(token);
    next();
  } catch (error) {
    next(new AppError(401, 'No autenticado'));
  }
}

module.exports = { authenticate };

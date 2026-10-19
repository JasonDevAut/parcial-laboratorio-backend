const express = require('express');
const { requestLogger } = require('./middlewares/requestLogger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { authenticate } = require('./middlewares/authenticate');
const authRouter = require('./routes/auth');
const usuariosRouter = require('./routes/usuarios');
const salasRouter = require('./routes/salas');
const reservasRouter = require('./routes/reservas');

function createApp() {
  const app = express();
  app.use(requestLogger);
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ nombre: 'coworking-reservas' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', authenticate);
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/salas', salasRouter);
  app.use('/api/reservas', reservasRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };

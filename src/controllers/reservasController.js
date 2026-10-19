const reservasQuery = require('../db/SQL/queries/reservas');
const reservasCommand = require('../db/SQL/commands/reservas');
const { insertEvento } = require('../db/mongo/mongo');
const { exigirDueno } = require('../middlewares/authorize');
const { AppError, parseId } = require('../lib/http');

function mapReserva(row) {
  return {
    id: row.ReservaId,
    usuarioId: row.UsuarioId,
    salaId: row.SalaId,
    fechaInicio: new Date(row.FechaInicio).toISOString(),
    fechaFin: new Date(row.FechaFin).toISOString(),
    estado: row.Estado,
    fechaActualizacion: row.FechaActualizacion ? new Date(row.FechaActualizacion).toISOString() : null
  };
}

const MENSAJES = {
  1: 'El usuario o la sala no existe',
  2: 'El usuario o la sala no está activo',
  3: 'La sala ya tiene una reserva en ese horario',
  4: 'El intervalo de la reserva no es válido'
};

const ESTADOS = {
  1: 404,
  2: 409,
  3: 409,
  4: 400
};

async function registrar(req, res) {
  exigirDueno(req, req.body.usuarioId);
  const { codigo, reservaId } = await reservasCommand.registrar({
    usuarioId: req.body.usuarioId,
    salaId: req.body.salaId,
    fechaInicio: new Date(req.body.fechaInicio),
    fechaFin: new Date(req.body.fechaFin)
  });

  if (codigo !== 0) {
    throw new AppError(ESTADOS[codigo] || 500, MENSAJES[codigo] || 'No se pudo registrar la reserva');
  }

  const creada = await reservasQuery.obtener(reservaId);

  await insertEvento({
    accion: 'Registro Reserva',
    statusCode: 201,
    IP: req.ip || req.socket?.remoteAddress || '0.0.0.0',
    id_usuario: String(req.usuario.id),
    metodo: req.method,
    ruta: req.originalUrl,
    fecha_ejecucion: new Date(),
    reservaId
  });

  res.status(201).json(mapReserva(creada));
}

async function listar(req, res) {
  const salaId = req.query.salaId === undefined ? null : parseId(req.query.salaId);
  let usuarioId = req.query.usuarioId === undefined ? null : parseId(req.query.usuarioId);

  if (req.query.salaId !== undefined && !salaId) {
    throw new AppError(400, 'Datos inválidos', [
      { campo: 'salaId', mensaje: 'salaId debe ser un entero mayor que cero' }
    ]);
  }
  if (req.query.usuarioId !== undefined && !usuarioId) {
    throw new AppError(400, 'Datos inválidos', [
      { campo: 'usuarioId', mensaje: 'usuarioId debe ser un entero mayor que cero' }
    ]);
  }

  if (req.usuario.perfil !== 'Administrador') {
    if (usuarioId && usuarioId !== req.usuario.id) throw new AppError(403, 'No autorizado');
    usuarioId = req.usuario.id;
  }

  const rows = await reservasQuery.listar({ salaId, usuarioId });
  res.status(200).json(rows.map(mapReserva));
}

async function obtener(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Reserva no encontrada');

  const row = await reservasQuery.obtener(id);
  if (!row) throw new AppError(404, 'Reserva no encontrada');
  exigirDueno(req, row.UsuarioId);
  res.status(200).json(mapReserva(row));
}

async function cancelar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Reserva no encontrada');

  const actual = await reservasQuery.obtener(id);
  if (!actual) throw new AppError(404, 'Reserva no encontrada');
  exigirDueno(req, actual.UsuarioId);

  const row = await reservasCommand.cancelar(id);
  if (!row) throw new AppError(404, 'Reserva no encontrada');
  res.status(200).json(mapReserva(row));
}

module.exports = { registrar, listar, obtener, cancelar };

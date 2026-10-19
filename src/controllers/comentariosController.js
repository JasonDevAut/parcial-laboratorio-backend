const { Int32 } = require('mongodb');
const reservasQuery = require('../db/SQL/queries/reservas');
const { getDb, insertEvento } = require('../db/mongo/mongo');
const { exigirDueno } = require('../middlewares/authorize');
const { AppError, parseId } = require('../lib/http');

function mapComentario(documento) {
  return {
    id: documento._id.toString(),
    reservaId: documento.reservaId,
    texto: documento.texto,
    fecha: new Date(documento.fecha).toISOString()
  };
}

async function reservaDelUsuario(req, id) {
  const reservaId = parseId(id);
  if (!reservaId) throw new AppError(404, 'Reserva no encontrada');
  const reserva = await reservasQuery.obtener(reservaId);
  if (!reserva) throw new AppError(404, 'Reserva no encontrada');
  exigirDueno(req, reserva.UsuarioId);
  return reservaId;
}

async function crear(req, res) {
  const reservaId = await reservaDelUsuario(req, req.params.id);

  const fecha = new Date();
  const documento = {
    reservaId: new Int32(reservaId),
    texto: req.body.texto.trim(),
    fecha
  };

  const resultado = await getDb().collection('comentarios').insertOne(documento);
  const comentarioId = resultado.insertedId.toString();

  await insertEvento({
    accion: 'Registro Comentario',
    statusCode: 201,
    IP: req.ip || req.socket?.remoteAddress || '0.0.0.0',
    id_usuario: String(req.usuario.id),
    metodo: req.method,
    ruta: req.originalUrl,
    fecha_ejecucion: new Date(),
    reservaId,
    texto: documento.texto
  });

  res.status(201).json({
    id: comentarioId,
    reservaId,
    texto: documento.texto,
    fecha: fecha.toISOString()
  });
}

async function listar(req, res) {
  const reservaId = await reservaDelUsuario(req, req.params.id);

  const documentos = await getDb()
    .collection('comentarios')
    .find({ reservaId: new Int32(reservaId) })
    .sort({ fecha: 1 })
    .toArray();

  res.status(200).json(documentos.map(mapComentario));
}

module.exports = { crear, listar };

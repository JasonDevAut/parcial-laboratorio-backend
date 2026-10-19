const salasQuery = require('../db/SQL/queries/salas');
const salasCommand = require('../db/SQL/commands/salas');
const { AppError, parseId } = require('../lib/http');

function mapSala(row) {
  return {
    id: row.SalaId,
    nombre: row.Nombre,
    capacidad: row.Capacidad,
    ubicacion: row.Ubicacion,
    descripcion: row.Descripcion,
    activa: Boolean(row.Activa),
    fechaActualizacion: row.FechaActualizacion ? new Date(row.FechaActualizacion).toISOString() : null
  };
}

function descripcionOrNull(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return String(value).trim();
}

async function crear(req, res) {
  const row = await salasCommand.insertar({
    nombre: req.body.nombre.trim(),
    capacidad: req.body.capacidad,
    ubicacion: req.body.ubicacion.trim(),
    descripcion: descripcionOrNull(req.body.descripcion)
  });
  res.status(201).json(mapSala(row));
}

async function listar(req, res) {
  const rows = await salasQuery.listar();
  res.status(200).json(rows.map(mapSala));
}

async function obtener(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Sala no encontrada');

  const row = await salasQuery.obtener(id);
  if (!row) throw new AppError(404, 'Sala no encontrada');
  res.status(200).json(mapSala(row));
}

async function actualizar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Sala no encontrada');

  const row = await salasCommand.actualizar({
    id,
    nombre: req.body.nombre.trim(),
    capacidad: req.body.capacidad,
    ubicacion: req.body.ubicacion.trim(),
    descripcion: descripcionOrNull(req.body.descripcion)
  });
  if (!row) throw new AppError(404, 'Sala no encontrada');
  res.status(200).json(mapSala(row));
}

async function desactivar(req, res) {
  const id = parseId(req.params.id);
  if (!id) throw new AppError(404, 'Sala no encontrada');

  const row = await salasCommand.desactivar(id);
  if (!row) throw new AppError(404, 'Sala no encontrada');
  res.status(200).json(mapSala(row));
}

module.exports = { crear, listar, obtener, actualizar, desactivar };

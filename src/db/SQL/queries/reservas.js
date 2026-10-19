const { sql, ejecutar } = require('../sql');

async function listar({ salaId, usuarioId }) {
  const result = await ejecutar('dbo.sp_listar_reservas', (request) => {
    request.input('SalaId', sql.Int, salaId);
    request.input('UsuarioId', sql.Int, usuarioId);
  });
  return result.recordset;
}

async function obtener(id) {
  const result = await ejecutar('dbo.sp_obtener_reserva', (request) => {
    request.input('ReservaId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

async function existe(id) {
  const result = await ejecutar('dbo.sp_existe_reserva', (request) => {
    request.input('ReservaId', sql.Int, id);
  });
  return Boolean(result.recordset[0]);
}

module.exports = { listar, obtener, existe };

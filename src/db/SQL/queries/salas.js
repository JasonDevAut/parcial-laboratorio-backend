const { sql, ejecutar } = require('../sql');

async function listar() {
  const result = await ejecutar('dbo.sp_listar_salas', () => {});
  return result.recordset;
}

async function obtener(id) {
  const result = await ejecutar('dbo.sp_obtener_sala', (request) => {
    request.input('SalaId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

module.exports = { listar, obtener };

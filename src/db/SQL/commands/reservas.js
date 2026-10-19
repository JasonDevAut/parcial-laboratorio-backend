const { sql, ejecutar } = require('../sql');

async function registrar({ usuarioId, salaId, fechaInicio, fechaFin }) {
  const result = await ejecutar('dbo.sp_registrar_reserva', (request) => {
    request.input('UsuarioId', sql.Int, usuarioId);
    request.input('SalaId', sql.Int, salaId);
    request.input('FechaInicio', sql.DateTime2, fechaInicio);
    request.input('FechaFin', sql.DateTime2, fechaFin);
    request.output('ReservaId', sql.Int);
    request.output('Codigo', sql.Int);
  });

  return {
    codigo: result.output.Codigo,
    reservaId: result.output.ReservaId
  };
}

async function cancelar(id) {
  const result = await ejecutar('dbo.sp_cancelar_reserva', (request) => {
    request.input('ReservaId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

module.exports = { registrar, cancelar };

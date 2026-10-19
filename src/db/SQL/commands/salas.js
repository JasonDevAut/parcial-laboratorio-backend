const { sql, ejecutar } = require('../sql');

async function insertar({ nombre, capacidad, ubicacion, descripcion }) {
  const result = await ejecutar('dbo.sp_insertar_sala', (request) => {
    request.input('Nombre', sql.NVarChar(120), nombre);
    request.input('Capacidad', sql.Int, capacidad);
    request.input('Ubicacion', sql.NVarChar(150), ubicacion);
    request.input('Descripcion', sql.NVarChar(500), descripcion);
  });
  return result.recordset[0];
}

async function actualizar({ id, nombre, capacidad, ubicacion, descripcion }) {
  const result = await ejecutar('dbo.sp_actualizar_sala', (request) => {
    request.input('SalaId', sql.Int, id);
    request.input('Nombre', sql.NVarChar(120), nombre);
    request.input('Capacidad', sql.Int, capacidad);
    request.input('Ubicacion', sql.NVarChar(150), ubicacion);
    request.input('Descripcion', sql.NVarChar(500), descripcion);
  });
  return result.recordset[0] || null;
}

async function desactivar(id) {
  const result = await ejecutar('dbo.sp_desactivar_sala', (request) => {
    request.input('SalaId', sql.Int, id);
  });
  return result.recordset[0] || null;
}

module.exports = { insertar, actualizar, desactivar };

const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validate, reservaSchema, comentarioSchema } = require('../middlewares/validate');
const reservas = require('../controllers/reservasController');
const comentarios = require('../controllers/comentariosController');

const router = express.Router();

router.post('/', validate(reservaSchema()), asyncHandler(reservas.registrar));
router.get('/', asyncHandler(reservas.listar));
router.get('/:id', asyncHandler(reservas.obtener));
router.delete('/:id', asyncHandler(reservas.cancelar));
router.post('/:id/comentarios', validate(comentarioSchema()), asyncHandler(comentarios.crear));
router.get('/:id/comentarios', asyncHandler(comentarios.listar));

module.exports = router;

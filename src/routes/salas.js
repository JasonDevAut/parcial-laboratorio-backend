const express = require('express');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validate, salaSchema } = require('../middlewares/validate');
const { authorize } = require('../middlewares/authorize');
const salas = require('../controllers/salasController');

const router = express.Router();

router.post('/', authorize('Administrador'), validate(salaSchema()), asyncHandler(salas.crear));
router.get('/', asyncHandler(salas.listar));
router.get('/:id', asyncHandler(salas.obtener));
router.put('/:id', authorize('Administrador'), validate(salaSchema()), asyncHandler(salas.actualizar));
router.delete('/:id', authorize('Administrador'), asyncHandler(salas.desactivar));

module.exports = router;

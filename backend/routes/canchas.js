import express from 'express';
const router = express.Router();
import canchaController from '../controllers/canchas.js';

router.get('/', canchaController.obtenerTodas);

router.get('/:id', canchaController.obtenerPorId);

export default router;
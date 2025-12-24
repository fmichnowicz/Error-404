import { Router } from "express";
import {
    getAllReservas,
    getReservaById,
    createReserva,
    updateReserva,
    deleteReserva,
    getReservasParaGrilla,
    getReservasByEstablecimiento
} from "../controllers/reservas-controllers.js"

const router = Router();

// Rutas específicas
router.get("/by-establecimiento", getReservasByEstablecimiento);
router.get("/grilla", getReservasParaGrilla);

// Rutas genéricas
router.get("/", getAllReservas);
router.get("/:id", getReservaById);
router.post("/", createReserva);
router.put("/:id", updateReserva);
router.delete("/:id", deleteReserva);

export default router;
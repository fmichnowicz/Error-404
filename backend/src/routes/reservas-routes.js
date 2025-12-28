import { Router } from "express";
import {
    getAllReservas,
    getReservaById,
    createReserva,
    updateReserva,
    deleteReserva,
    getReservasParaGrilla,
    getReservasByEstablecimiento,
    getReservasByCancha
} from "../controllers/reservas-controllers.js"

const router = Router();

// Rutas estáticas específicas
router.get("/by-establecimiento", getReservasByEstablecimiento);
router.get("/by-cancha", getReservasByCancha);
router.get("/grilla", getReservasParaGrilla);

// Rutas dinámicas o generales
router.get("/", getAllReservas);
router.get("/:id", getReservaById);
router.post("/", createReserva);
router.put("/:id", updateReserva);
router.delete("/:id", deleteReserva);

export default router;
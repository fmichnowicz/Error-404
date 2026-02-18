import { Router } from "express";
import {
    getAllCanchas,
    getCanchaById,
    createCancha,
    updateCancha,
    deleteCancha,
    getNextCanchaNumber
} from "../controllers/canchas-controllers.js"

const router = Router();

// Rutas estáticas específicas
router.get('/next-cancha', getNextCanchaNumber);

// Rutas dinámicas o generales
router.get("/", getAllCanchas);
router.get("/:id", getCanchaById);
router.post("/", createCancha);
router.put("/:id", updateCancha);
router.delete("/:id", deleteCancha);

export default router;
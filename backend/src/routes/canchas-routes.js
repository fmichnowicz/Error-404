import { Router } from "express";
import {
    getAllCanchas,
    getCanchaById,
    createCancha,
    updateCancha,
    deleteCancha
} from "../controllers/canchas-controllers.js"

const router = Router();

// Rutas genéricas
router.get("/", getAllCanchas);
router.get("/:id", getCanchaById);
router.post("/", createCancha);
router.put("/:id", updateCancha);
router.delete("/:id", deleteCancha);

export default router;
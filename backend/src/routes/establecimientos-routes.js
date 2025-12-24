import { Router } from "express";
import {
    getAllEstablecimientos,
    getEstablecimientoById,
    createEstablecimiento,
    updateEstablecimiento,
    deleteEstablecimiento
} from "../controllers/establecimientos-controllers.js"

const router = Router();

// Rutas genéricas
router.get("/", getAllEstablecimientos);
router.get("/:id", getEstablecimientoById);
router.post("/", createEstablecimiento);
router.put("/:id", updateEstablecimiento);
router.delete("/:id", deleteEstablecimiento);

export default router;
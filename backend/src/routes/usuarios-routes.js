import { Router } from "express";
import {
    getAllUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    buscarUsuariosPorNombre
} from "../controllers/usuarios-controllers.js"

const router = Router();

// Rutas específicas
router.get("/buscar", buscarUsuariosPorNombre);

// Rutas genéricas
router.get("/", getAllUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

export default router;
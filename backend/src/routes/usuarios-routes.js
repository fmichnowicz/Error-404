import { Router } from "express";
import {
    getAllUsuarios,
    getUsuarioById,
    createUsuario
} from "../controllers/usuarios-controllers.js"

const router = Router();

router.get("/", getAllUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);

export default router;
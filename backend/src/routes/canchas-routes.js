import { Router } from "express";
import {
    getAllCanchas,
    getCanchaById,
    createCancha,
    updateCancha,
} from "../controllers/canchas-controllers.js"

const router = Router();

router.get("/", getAllCanchas);
router.get("/:id", getCanchaById);
router.post("/", createCancha);
router.put("/:id", updateCancha);

export default router;
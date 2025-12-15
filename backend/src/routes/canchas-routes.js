import { Router } from "express";
import {
    getAllCanchas,
    getCanchaById,
    createCancha,
} from "../controllers/canchas-controllers.js"

const router = Router();

router.get("/", getAllCanchas);
router.get("/:id", getCanchaById);
router.post("/", createCancha);

export default router;
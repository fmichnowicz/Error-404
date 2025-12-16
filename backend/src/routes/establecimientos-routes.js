import { Router } from "express";
import {
    getAllEstablecimientos
} from "../controllers/establecimientos-controllers.js"

const router = Router();

router.get("/", getAllEstablecimientos);

export default router;
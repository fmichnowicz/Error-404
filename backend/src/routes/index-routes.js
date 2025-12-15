import { Router } from "express";
import canchasRoutes from "./canchas-routes.js";

const router = Router();

router.use("/canchas", canchasRoutes);

export default router;
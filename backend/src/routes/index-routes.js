import { Router } from "express";
import canchasRoutes from "./canchas-routes.js";
import establecimientosRoutes from "./establecimientos-routes.js"

const router = Router();

router.use("/canchas", canchasRoutes);
router.use("/establecimientos", establecimientosRoutes);

export default router;
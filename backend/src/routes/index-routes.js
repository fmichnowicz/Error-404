import { Router } from "express";
import canchasRoutes from "./canchas-routes.js";
import establecimientosRoutes from "./establecimientos-routes.js"
import usuariosRoutes from "./usuarios-routes.js"
import reservasRoutes from "./reservas-routes.js"

const router = Router();

router.use("/canchas", canchasRoutes);
router.use("/establecimientos", establecimientosRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/reservas", reservasRoutes);

export default router;
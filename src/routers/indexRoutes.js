import { Router } from "express";
import transactionsRoutes from "./transactionsRoutes.js";
import usersRoutes from "./usersRoutes.js";

const router = Router();
router.use(usersRoutes);
router.use(transactionsRoutes);

export default router;

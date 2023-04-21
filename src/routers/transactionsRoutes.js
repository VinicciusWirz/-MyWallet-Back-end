import { authValidation } from "../middlewares/authMiddleware.js";
import {
  deleteTransaction,
  getTransactions,
  newTransaction,
} from "../controllers/transactionsControllers.js";
import { Router } from "express";
import { transactionsSchema } from "../schemas/transactionsSchemas.js";
import { validateSchema } from "../middlewares/validateSchemaMiddleware.js";

const router = Router();

router.use(authValidation);

router.post("/transactions", validateSchema(transactionsSchema), newTransaction);
router.get("/transactions", getTransactions);
router.delete("/transactions/:id", deleteTransaction);

export default router;

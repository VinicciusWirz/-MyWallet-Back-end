import { authValidation } from "../middlewares/authMiddleware.js";
import {
  changeTransaction,
  deleteTransaction,
  getTransactionID,
  getTransactions,
  newTransaction,
} from "../controllers/transactionsControllers.js";
import { Router } from "express";
import { transactionsSchema } from "../schemas/transactionsSchemas.js";
import { validateSchema } from "../middlewares/validateSchemaMiddleware.js";
import { validIDMiddleware } from "../middlewares/validIDMiddleware.js";

const router = Router();

router.use(authValidation);

router.post("/transactions", validateSchema(transactionsSchema), newTransaction);
router.get("/transactions", getTransactions);
router.get("/transactions/:id", validIDMiddleware, getTransactionID);
router.delete("/transactions/:id", validIDMiddleware, deleteTransaction);
router.put("/transactions/:id", validateSchema(transactionsSchema), validIDMiddleware, changeTransaction)

export default router;

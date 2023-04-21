import { Router } from "express";
import { signin, signup } from "../controllers/usersControllers.js";
import { signinSchema, signupSchema } from "../schemas/usersSchemas.js";
import { validateSchema } from "../middlewares/validateSchemaMiddleware.js";

const router = Router();

router.post("/sign-up", validateSchema(signupSchema), signup);
router.post("/sign-in", validateSchema(signinSchema), signin);

export default router;

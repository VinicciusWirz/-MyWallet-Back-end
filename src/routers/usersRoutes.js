import { Router } from "express";
import { signin, signup } from "../controllers/usersControllers.js";
import { signinSchema, signupSchema } from "../schemas/usersSchemas.js";
import { validEmail } from "../middlewares/validEmailMiddleware.js";
import { validateSchema } from "../middlewares/validateSchemaMiddleware.js";

const router = Router();

router.post("/sign-up", validateSchema(signupSchema), validEmail("registration"), signup);
router.post("/sign-in", validateSchema(signinSchema), validEmail("login"), signin);

export default router;

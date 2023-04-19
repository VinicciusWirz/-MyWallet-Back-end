import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Joi from "joi";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
  await mongoClient.connect();
  console.log("MongoDB Connected!");
} catch (error) {
  console.log(err);
}
const db = mongoClient.db();

//SCHEMAS
const signupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  repeat_password: Joi.ref("password"),
}).with("password", "repeat_password");

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

//CADASTRO
app.post("/sign-up", async (req, res) => {
  const validation = signupSchema.validate(req.body, { abortEarly: false });
  if (validation.error)
    return res
      .status(422)
      .send(validation.error.details.map((detail) => detail.message));
  const { name, email, password } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  try {
    const emailInDB = await db.collection("users").findOne({ email });
    if (emailInDB) return res.status(409).send("Email already in use");
    await db.collection("users").insertOne({ name, email, password: hash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//LOGIN
app.post("/sign-in", async (req, res) => {
  const validation = signinSchema.validate(req.body, { abortEarly: false });
  if (validation.error)
    return res
      .status(422)
      .send(validation.error.details.map((detail) => detail.message));
  const { email, password } = req.body;

  try {
    const emailInDB = await db.collection("users").findOne({ email });
    if (!emailInDB) return res.status(404).send("Email is not registered");
    const passwordMatch = bcrypt.compareSync(password, emailInDB.password);
    if (emailInDB && passwordMatch) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

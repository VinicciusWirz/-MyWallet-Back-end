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

const signupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  repeat_password: Joi.ref("password"),
}).with("password", "repeat_password");

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
    const emailInUse = await db.collection("users").findOne({ email });
    if (emailInUse) return res.status(409).send("Email already in use");
    await db.collection("users").insertOne({ name, email, password: hash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

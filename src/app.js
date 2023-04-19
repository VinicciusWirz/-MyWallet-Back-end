import bcrypt from "bcrypt";
import cors from "cors";
import dayjs from "dayjs";
import dotenv from "dotenv";
import express from "express";
import Joi from "joi";
import { MongoClient } from "mongodb";
import { v4 as uuid } from "uuid";

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

const transactionsSchema = Joi.object({
  description: Joi.string().required(),
  value: Joi.number().required(),
  type: Joi.string().valid("withdraw", "deposit").required(),
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
      const token = uuid();
      await db
        .collection("sessions")
        .insertOne({ userID: emailInDB._id, token });
      res.status(200).send(token);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//TRANSACTIONS
app.post("/transactions", async (req, res) => {
  const { authorization } = req.headers;
  const { description, value, type } = req.body;
  if (!authorization) return res.sendStatus(401);
  const token = authorization.replace("Bearer ", "");

  const validation = transactionsSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validation.error)
    return res
      .status(422)
      .send(validation.error.details.map((detail) => detail.message));

  try {
    const date = dayjs().format("DD/MM/YYYY");
    const time = dayjs().format("HH:mm");
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);

    const user = await db.collection("users").findOne({ _id: session.userID });
    if (!user) return res.sendStatus(401);

    const userTransactions = await db
      .collection("transactions")
      .findOne({ userID: session.userID });
    if (userTransactions) {
      const transactionsArray = [
        ...userTransactions.transactions,
        {
          description,
          value,
          type,
          date,
          time,
        },
      ];
      await db
        .collection("transactions")
        .updateOne(
          { userID: session.userID },
          { $set: { transactions: transactionsArray } }
        );
      res.sendStatus(200);
    } else {
      await db.collection("transactions").insertOne({
        userID: session.userID,
        transactions: [{ description, value, type, date, time }],
      });
      res.sendStatus(200);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/transactions", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);
  const token = authorization.replace("Bearer ", "");

  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);
    const user = await db.collection("users").findOne({ _id: session.userID });
    if (!user) return res.sendStatus(401);
    const userTransactions = await db
      .collection("transactions")
      .findOne({ userID: session.userID });
    if (userTransactions) {
      res.status(200).send({ transactions: userTransactions.transactions });
    } else {
      res.status(200).send({ transactions: [] });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

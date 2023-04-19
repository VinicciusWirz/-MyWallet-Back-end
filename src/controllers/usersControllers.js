import bcrypt from "bcrypt";
import { db } from "../app.js";
import Joi from "joi";
import { v4 as uuid } from "uuid";

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

export async function signin(req, res) {
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
      res.status(200).send({ name: emailInDB.name, token });
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function signup(req, res) {
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
}

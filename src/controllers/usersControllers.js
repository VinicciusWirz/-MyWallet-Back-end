import bcrypt from "bcrypt";
import { db } from "../database/databaseConnection.js";
import { v4 as uuid } from "uuid";
import { stripHtml } from "string-strip-html";

export async function signin(req, res) {
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
  const { name, email, password } = req.body;
  const sanitizeName = stripHtml(name).result.trim()

  const hash = bcrypt.hashSync(password, 10);

  try {
    const emailInDB = await db.collection("users").findOne({ email });
    if (emailInDB) return res.status(409).send("Email already in use");
    await db.collection("users").insertOne({ name: sanitizeName, email, password: hash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

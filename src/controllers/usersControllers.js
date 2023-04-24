import bcrypt from "bcrypt";
import { db } from "../database/databaseConnection.js";
import { v4 as uuid } from "uuid";
import { stripHtml } from "string-strip-html";

export async function signin(req, res) {
  const passwordInput = req.body.password;

  try {
    const { _id: userID, name, password } = res.locals.userInfo;
    const passwordMatch = bcrypt.compareSync(passwordInput, password);
    if (passwordMatch) {
      const token = uuid();
      await db.collection("sessions").insertOne({ userID, token });
      res.status(200).send({ name, token });
    } else {
      res.status(401).send("Wrong password");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  const sanitizeName = stripHtml(name).result.trim();

  const hash = bcrypt.hashSync(password, 10);

  try {
    await db
      .collection("users")
      .insertOne({ name: sanitizeName, email, password: hash });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

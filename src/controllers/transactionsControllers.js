import dayjs from "dayjs";
import Joi from "joi";
import { ObjectId } from "mongodb";
import { db } from "../app.js";

const transactionsSchema = Joi.object({
  description: Joi.string().required(),
  value: Joi.number().required(),
  type: Joi.string().valid("withdraw", "deposit").required(),
});

export async function newTransaction(req, res) {
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
          id: new ObjectId(),
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
        transactions: [
          { id: new ObjectId(), description, value, type, date, time },
        ],
      });
      res.sendStatus(200);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function getTransactions(req, res) {
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
}

export async function deleteTransaction(req, res) {
  if (!req.params.id) return res.status(401).send("Missing id");
  const transactionID = new ObjectId(req.params.id);
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).send("Missing authorization");
  const token = authorization?.replace("Bearer ", "");

  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.status(401).send("Invalid Token");

    const user = await db.collection("users").findOne({ _id: session.userID });
    if (!user) return res.status(401).send("Cannot find user");

    const filter = { userID: session.userID };
    const query = { $pull: { transactions: { id: transactionID } } };
    const updateTransactions = await db
      .collection("transactions")
      .updateOne(filter, query);

    if (updateTransactions.modifiedCount === 0) {
      return res.status(404).send("Could not find transaction");
    }
    res.status(200).send("Transaction deleted successfully");
  } catch (error) {
    console.error("Unable to connect with DB:", error);
    res.status(500).send(error.message);
  }
}

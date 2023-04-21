import dayjs from "dayjs";
import { db } from "../database/databaseConnection.js";
import { ObjectId } from "mongodb";

export async function newTransaction(req, res) {
  const { description, value, type } = req.body;

  try {
    const date = dayjs().format("DD/MM/YYYY");
    const time = dayjs().format("HH:mm");
    const session = res.locals.session;

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
  try {
    const session = res.locals.session;

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
  const transactionID = res.locals.transactionID;

  try {
    const session = res.locals.session;
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

export async function getTransactionID(req, res) {
  const transactionID = res.locals.transactionID;
  try {
    const session = res.locals.session;
    const filter = { userID: session.userID };
    const userTransactions = await db
      .collection("transactions")
      .findOne(filter);
    const transactionOBJ = userTransactions.transactions.find((t) =>
      t.id.equals(transactionID)
    );
    if (!transactionOBJ)
      return res
        .status(401)
        .send("Could not find this transaction for this user");

    res.status(200).send(transactionOBJ);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function changeTransaction(req, res) {
  const transactionID = res.locals.transactionID;
  const { description, value } = req.body;
  try {
    const session = res.locals.session;
    const filter = { userID: session.userID, "transactions.id": transactionID };
    const update = {
      $set: {
        "transactions.$.description": description,
        "transactions.$.value": value,
      },
    };
    const updatedTransaction = await db
      .collection("transactions")
      .updateOne(filter, update);
    if (updatedTransaction.matchedCount === 0) return res.sendStatus(404);
    let okMessage = "OK";
    if (updatedTransaction.modifiedCount === 0) {
      okMessage = "No data has changed";
    }
    res.status(200).send(okMessage);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

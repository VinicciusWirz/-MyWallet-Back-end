import { ObjectId } from "mongodb";
import { db } from "../database/databaseConnection.js";

export async function validIDMiddleware(req, res, next) {
  if (!req.params.id) return res.status(401).send("Missing id");
  if (!ObjectId.isValid(req.params.id)) return res.sendStatus(400);
  const transactionID = new ObjectId(req.params.id);
  res.locals.transactionID = transactionID;
  try {
    const session = res.locals.session;
    const filter = { userID: session.userID, "transactions.id": transactionID };
    const validID = await db.collection("transactions").findOne(filter);
    if (!validID) return res.status(401).send("No such transaction for this user");
    next();
  } catch (error) {
    res.status(500).send(error.message);
  }
}

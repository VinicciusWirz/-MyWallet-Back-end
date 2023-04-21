import { db } from "../database/databaseConnection.js";

export async function authValidation(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);
  const token = authorization.replace("Bearer ", "");

  try {
    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.status(401).send("Token Expired");
    const user = await db.collection("users").findOne({ _id: session.userID });
    if (!user) return res.status(401).send("User is not in database");

    res.locals.session = session;

    next();
  } catch (error) {
    res.status(500).send(err.message);
  }
}

import { db } from "../database/databaseConnection.js";

export function validEmail(operation) {
  return async (req, res, next) => {
    const { email } = req.body;
    try {
      const emailInDB = await db.collection("users").findOne({ email });
      if (operation === "registration" && emailInDB) return res.status(409).send("Email already in use");
      if (operation === "login" && !emailInDB) return res.status(404).send("Email is not registered");
      res.locals.userInfo = emailInDB;
      next();
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import { signin, signup } from "./controllers/usersControllers.js";
import {
  getTransactions,
  newTransaction,
} from "./controllers/transactionsControllers.js";

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
export const db = mongoClient.db();

//CADASTRO
app.post("/sign-up", signup);

//LOGIN
app.post("/sign-in", signin);

//TRANSACTIONS
app.post("/transactions", newTransaction);

app.get("/transactions", getTransactions);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

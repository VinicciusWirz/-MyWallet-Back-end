import cors from "cors";

import express from "express";

import routes from "./routers/indexRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));

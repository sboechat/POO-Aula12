import express from "express";
import { router } from "./routes";

const app = express();
app.use(express.json());

// Usando as rotas
app.use(router);

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true, db: "sqlite" }));

app.listen(3000, () => console.log("Server rodando em http://localhost:3000"));

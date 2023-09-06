import express from "express";

import createInitialData from "./src/config/db/initialData.js";
import userRoutes from "./src/modules/user/routes/userRoutes.js";

import tracing from "./src/config/tracing.js";

const app = express();
const env = process.env;
const PORT = env.PORT || 3030;
const CONTAINER_ENV = "container";

app.get("/api/status", (req, res) => res.status(200).json({
  service: "auth-api",
  status: "on",
  httpStatus: 200,
}));

app.use(express.json());

function startAplication() {
  if (env.NODE_ENV !== CONTAINER_ENV) {
    createInitialData();
  }
}

startAplication();

app.get("/api/initial-data", (req, res) => {
  createInitialData();
  return res.status(200).json({
    message: "Data was successfully created.",
  });
});

app.use(tracing);
app.use(userRoutes);

app.listen(PORT, () => {
  console.info(`Server listening on ${PORT}`);
});

import express from "express";
import cors from "cors";

import { ENV } from "./config/env.config";

import printRoutes from "./routes/print.route";
import deviceRoutes from "./routes/device.route";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/api/print", printRoutes);
app.use("/api/device", deviceRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});

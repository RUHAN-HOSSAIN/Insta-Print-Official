import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./types";
import { getDeviceStatus } from "./controllers/device.controller";
import { submitPrintJob } from "./controllers/print.controller";
import { HallId } from "./config/constants";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());
// app.use(       //  origin: jei url theke request ashe, sei url ta origin hishebe pabe
//   "*",
//   cors({
//     origin: (origin, c) => {
//       return origin === c.env.FRONTEND_URL ? origin : "";
//     },
//   })
// );

// app.use(
//   "*",
//   cors({
//     origin: (origin, c) => {
//       const allowedOrigins = [
//         c.env.FRONTEND_URL,
//         "http://localhost:5173",
//       ];

//       return allowedOrigins.includes(origin) ? origin : "";
//     },
//   })
// );

app.get("/health", (c) => c.json({ status: "ok" }));

// GET /status?hallId=shaheed_hadi_hall
app.get("/status", (c) => {
  const hallId = c.req.query("hallId") as HallId;
  return getDeviceStatus(c.env, hallId);
});

// POST /print
app.post("/print", (c) => submitPrintJob(c.req.raw, c.env));

export default app;

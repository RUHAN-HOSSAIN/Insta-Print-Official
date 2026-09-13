import { Context } from "hono";
import { Env } from "../types";
import { IncomingMfsSms } from "./mfs.types";
import { parseIncomingMfsSms } from "./sms.parser";
import { saveMfsTransaction } from "./mfs.service";

export async function handleIncomingMfsSms(c: Context<{ Bindings: Env }>) {
  const message = (await c.req.text()).trim();
  const input: IncomingMfsSms = {
    message,
  };

  if (!message) {
    return c.json({ error: "SMS message is required." }, 400);
  }

  let parsed;
  try {
    parsed = parseIncomingMfsSms(input);
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : "Invalid SMS format.",
    }, 422);
  }
  if (!parsed) {
    return c.json({ status: "ignored", reason: "Unsupported MFS SMS type." }, 200);
  }

  try {
    const saved = await saveMfsTransaction(c.env, parsed.transaction);
    return c.json({
      status: "accepted",
      message: "Receive-money SMS parsed and saved successfully.",
      transaction: { ...parsed.transaction, ...saved },
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save MFS transaction";
    return c.json({ error: message }, message.includes("already") ? 409 : 500);
  }
}

import { Router } from "express";
import { getDeviceStatus } from "../controllers/device.controller";

const router = Router();

router.get("/status", getDeviceStatus);

export default router;
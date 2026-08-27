import { Router } from "express";
import multer from "multer";
import { submitPrintJob } from "../controllers/print.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// multiple files
router.post("/", upload.array("files"), submitPrintJob);

export default router;
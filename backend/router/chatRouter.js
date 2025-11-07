import express from "express";
import { chat } from "../controller/chatController.js";
import { apiKeyAuth } from "../middlewares/apiKeyAuth.js";

const router = express.Router();

router.post("/chat", apiKeyAuth, chat);

export default router;

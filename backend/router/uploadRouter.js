import express from "express";
import  {uploadFiles} from "../controller/uploader.js";
import {uploadVideosAndTranscribe } from "../controller/videoUpload.js";
import { protectRoute } from "../middlewares/protectedRoute.js";

const router = express.Router();

router.post('/upload',protectRoute,uploadFiles);
router.post('/videoUpload',protectRoute,uploadVideosAndTranscribe);

export default router;
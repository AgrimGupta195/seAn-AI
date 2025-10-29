import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./router/uploadRouter.js"
import connectDB from "./lib/db.js"
import userRouter from "./router/userRouter.js"
import cookieParser from "cookie-parser";
dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));
app.use(express.json({limit: "500mb"}));
app.use(cookieParser());

app.use("/api/uploadFile",uploadRouter);
app.use("/api/user",userRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



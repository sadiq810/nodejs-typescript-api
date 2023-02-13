import express from "express";
import cors from "cors";
import {routes} from "./routes";
import "reflect-metadata";
import cookieParser from "cookie-parser";

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000"]
}));

routes(app);

export default app;


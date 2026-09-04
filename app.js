import express from "express";
import dotenv from "dotenv";
import { docload } from "./docload.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded());


const filepath = process.env.FILE_PATH || "sample.pdf";

docload(filepath)

export default app;
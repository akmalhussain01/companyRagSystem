import express from "express";
import dotenv from "dotenv";
import { chatHandler } from "./chatHandler.js";
import cors from "cors";
dotenv.config();

const app = express();

const corsOptions = ['http://localhost:5173']

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/api/chatbot').post(chatHandler);

export default app;
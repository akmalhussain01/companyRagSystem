import chatbot from "./chatbot.js";

async function chatHandler(req, res) {
    try {
        const { question } = req.body;
        if (!question || typeof question !== "string") {
            return res.status(400).json({ error: "question is required" });
        }
        const answer = await chatbot(question);
        res.json({ answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong answering the question." });
    }
}

export { chatHandler };
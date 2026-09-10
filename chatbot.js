import Groq from "groq-sdk";
import { vectorStore } from "./docload.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chatbot(question) {
    const relevantChunks = await vectorStore.similaritySearch(question, 3);
    const context = relevantChunks.map((chunk) => chunk.pageContent).join("\n\n");

    const SYSTEM_PROMPT = `You are a helpful assistant for Nexora Systems.

You will be given some CONTEXT retrieved from the company handbook, followed by a QUESTION.

- If the CONTEXT contains information relevant to the question, answer using that context and prioritize it as the source of truth.
- If the CONTEXT does not contain relevant information (e.g. the question is general knowledge, casual conversation, or unrelated to company policy), ignore the context and answer normally using your own knowledge.
- Don't mention the context, retrieval, or that you're an AI system pulling from documents. Just answer naturally.`;

    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}\nAnswer:`;

    const completion = await groq.chat.completions.create({
        model: "groq/compound",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
        ],
    });

    return completion.choices[0].message.content;
}

export default chatbot;
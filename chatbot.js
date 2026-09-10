import readline from 'readline/promises'
import Groq from "groq-sdk";
import { vectorStore } from './docload.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chatbot() {

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    while (true) {

        const question = await rl.question('Ask a question (or type "exit" to quit): ');
        // console.log(question);

        if (question.toLowerCase() === 'exit') {
            break;
        }
        const relevantchunks = await vectorStore.similaritySearch(question, 3);
        const context = relevantchunks.map((chunk) => chunk.pageContent).join("\n\\n");
        // console.log(context);

        const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided context. If the answer is not contained within the context, respond with "I don't know."`;

        const userPrompt = `Context:\n${context}\n\nQuestion: ${question}\nAnswer:`;

        const completion = await groq.chat.completions.create({
            model: "groq/compound",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
        });
        console.log(`Assistant: ${completion.choices[0].message.content}`);

    }

    rl.close();

}

chatbot();
// export default chatbot;
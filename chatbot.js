import readline from 'readline/promises'
import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chatbot() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    while (true) {

        const question = await rl.question('Ask a question (or type "exit" to quit): ');
        console.log(question);

        if (question.toLowerCase() === 'exit') {
            break;
        }

    }
    rl.close();

    // const completion = await groq.chat.completions.create({
    //     model: "groq/compound",
    //     messages: [
    //         {
    //             role: "user",
    //             content: "Explain why fast inference is critical for reasoning models",
    //         },
    //     ],
    // });
    // console.log(completion.choices[0]?.message?.content);
}

chatbot();
// export default chatbot;
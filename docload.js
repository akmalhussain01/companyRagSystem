import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();

const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2",
});

// 3. Embed + store in Pinecone
const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
        pineconeIndex,
        maxConcurrency: 5,
    }
);

const docload = async (filepath) => {

    // 1. Load the PDF
    const loader = new PDFLoader(filepath, { splitPages: false });
    const doc = await loader.load();
    console.log("load the document",doc);
    


    // 2. Chunk the text
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });
    const chunks = await splitter.createDocuments([doc[0].pageContent]);

    console.log(`Loaded ${filepath} -> ${chunks.length} chunks`);

    //create the documents and index it in pinecone
    const documents = chunks.map((chunk) => {
        return {
            pageContent: chunk.pageContent,
            metadata: doc[0].metadata,
        }
    })


    await vectorStore.addDocuments(documents);
    console.log('completed');


};

export { docload, vectorStore };
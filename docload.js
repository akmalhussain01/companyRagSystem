import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";

// Free, local embedding model — no API key, no cost.
// Runs on your machine via @xenova/transformers under the hood.
const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2", // 384-dim, fast, good quality for general text
});

const docload = async (filepath) => {
    // 1. Load the PDF
    const loader = new PDFLoader(filepath, { splitPages: false });
    const doc = await loader.load();

    // 2. Chunk the text
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,     // note: camelCase — chunk_size/chunk_overlap silently do nothing
        chunkOverlap: 50,   // a little overlap preserves context across chunk boundaries
    });
    const chunks = await splitter.createDocuments([doc[0].pageContent]);

    console.log(`Loaded ${filepath} -> ${chunks.length} chunks`);

    // 3. Embed + store in MongoDB Atlas
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    const collection = client
        .db(process.env.MONGODB_DB_NAME)
        .collection(process.env.MONGODB_COLLECTION_NAME);

    await MongoDBAtlasVectorSearch.fromDocuments(chunks, embeddings, {
        collection,
        indexName: "vector_index", // must match the Atlas Search index you create
        textKey: "text",
        embeddingKey: "embedding",
    });

    await client.close();
    console.log("Stored embeddings in MongoDB Atlas.");
};

export { docload };
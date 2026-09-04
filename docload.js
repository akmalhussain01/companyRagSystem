import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

const docload = async (filepath) => {
    const loader = new PDFLoader(filepath)
    const docs = await loader.load()

    console.log(docs);

}

export { docload }
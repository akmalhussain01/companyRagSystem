import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

const docload = async (filepath) => {
    const loader = new PDFLoader(filepath, { splitPages: false })
    const doc = await loader.load()

    console.log(doc[0].pageContent);
}

export { docload }
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const docload = async (filepath) => {
    //load the doc
    const loader = new PDFLoader(filepath, { splitPages: false })
    const doc = await loader.load()

    console.log(doc[0].pageContent);

    //chunk the doc

    const text_splitter = new RecursiveCharacterTextSplitter({
        chunk_size: 500,
        chunk_overlap: 0
    });
    const texts = await text_splitter.splitText(doc[0].pageContent)
    console.log(texts.length)
}

export { docload }
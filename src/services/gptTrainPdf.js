import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import dotenv from "dotenv";
dotenv.config();

class GPTTrainPDF {
    constructor() {
        this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        this.model = new ChatOpenAI({
            modelName: "gpt-3.5-turbo",
            openAIApiKey: this.OPENAI_API_KEY,
        });
    }

    async loadPDF(path) {
        const loader = new PDFLoader(`./src/assets/pdf/${path}`);

        const docs = await loader.load();

        return docs;
    }

    async splitText(docs) {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 10,
        });

        const splitDocs = await textSplitter.splitDocuments(docs);

        return splitDocs;
    }

    async embedAndStore(splitDocs) {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.OPENAI_API_KEY,
        });

        const vectorStore = await FaissStore.fromDocuments(
            splitDocs,
            embeddings
        );

        await vectorStore.save("vectorstore-DB");
    }
}

export default GPTTrainPDF;

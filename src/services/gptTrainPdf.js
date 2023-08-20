import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
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

        this.client = new PineconeClient();
    }

    async loadPDF(path) {
        const loader = new PDFLoader(`./src/assets/pdf/${path}`);

        const docs = await loader.load();

        return docs;
    }

    async splitText(docs) {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1500,
            chunkOverlap: 50,
        });

        const splitDocs = await textSplitter.splitDocuments(docs);

        return splitDocs;
    }

    async embedAndStore(splitDocs) {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.OPENAI_API_KEY,
        });

        await this.client.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT,
        });
        const pineconeIndex = this.client.Index(process.env.PINECONE_INDEX);

        await PineconeStore.fromDocuments(splitDocs, embeddings, {
            pineconeIndex,
        });
    }
}

export default GPTTrainPDF;

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorDBQAChain } from "langchain/chains";
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

        this.template = `Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        Use three sentences maximum and keep the answer as concise as possible.
        {context}
        Question: {question}
        Helpful Answer:`;

        this.client = new PineconeClient();
    }

    async loadPDF() {
        const loader = new PDFLoader("src/assets/pdf/example2.pdf");

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

    async embedAndStore(splitDocs, path) {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.OPENAI_API_KEY,
        });

        await this.client.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT,
        });
        const pineconeIndex = this.client.Index("gpt-over-index");

        await PineconeStore.fromDocuments(splitDocs, embeddings, {
            pineconeIndex,
        });
    }

    async loadChain(question) {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.OPENAI_API_KEY,
        });
        await this.client.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT,
        });
        const pineconeIndex = this.client.Index("gpt-over-index");

        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
        });

        const chain = VectorDBQAChain.fromLLM(this.model, vectorStore, {
            k: 1,
            returnSourceDocuments: true,
        });

        console.log(question);
        console.log(typeof question);

        const response = await chain.call({
            query: question,
        });

        console.log("~~~~ ANSWER: ");
        console.log(response.text);

        // //  Returning source documents
        // console.log(response.sourceDocuments[0]);

        return response;
    }
}

export default GPTTrainPDF;

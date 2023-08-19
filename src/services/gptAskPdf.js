import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import dotenv from "dotenv";
dotenv.config();

class GPTOverPDF {
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

export default GPTOverPDF;

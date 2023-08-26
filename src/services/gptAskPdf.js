import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorDBQAChain } from "langchain/chains";
import { FaissStore } from "langchain/vectorstores/faiss";
import { PromptTemplate } from "langchain/prompts";
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
        If the question is not from the context, just say that you don't know. Don't even remotely answer the question which is out of context or is loosely conencted with the context.
        Use three sentences maximum and keep the answer as concise as possible.
        {context}
        Question: {question}
        Helpful Answer:`;

    }

    async loadChain(question) {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.OPENAI_API_KEY,
        });
        

        const vectorStore = await FaissStore.load("vectorstore-DB", embeddings);
        const chain = VectorDBQAChain.fromLLM(this.model, vectorStore, {
            k: 1,
            returnSourceDocuments: true,
            prompt: PromptTemplate.fromTemplate(this.template),
        });

        const response = await chain.call({
            query: question,
        });

        console.log("~~~~ ANSWER: ");
        console.log(response.text);

        // //  Returning source documents
        console.log(response.sourceDocuments[0]);

        return response;
    }
}
``;

export default GPTOverPDF;

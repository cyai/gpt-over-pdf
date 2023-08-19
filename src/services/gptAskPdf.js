import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import { PromptTemplate } from "langchain/prompts";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
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
    }

    async loadVectorStore(collectionName) {
        const vectorStore = await Chroma.fromExistingCollection(
            new OpenAIEmbeddings(),
            { collectionName: collectionName }
        );

        return vectorStore;
    }

    async loadChain(vectorStore, query) {
        const chain = RetrievalQAChain.fromLLM(
            this.model,
            vectorStore.asRetriever(),
            {
                prompt: PromptTemplate.fromTemplate(this.template),
            }
        );

        const response = await chain.call({
            query: query,
        });

        console.log(response);

        //  Returning source documents
        //   console.log(response.sourceDocuments[0]);

        return response;
    }
}

export default GPTOverPDF;

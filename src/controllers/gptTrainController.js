import express from "express";
import GPTTrainPDF from "../services/gptTrainPdf.js";

class TrainController {
    constructor() {
        this.path = "/gpt/pdf";
        this.router = express.Router();
        this.gptTrainPdf = new GPTTrainPDF();

        // Check if the cache has been initialized
        if (!TrainController.cache) {
            TrainController.cache = {
                docs: null,
                vectorStore: null,
            };
        }

        this.initializeRoutes();
    }

    async initializeVectorStore() {
        console.log("Embedding and storing");
        if (TrainController.cache.docs && TrainController.cache.vectorStore) {
            // Use cached data if available
            console.log("Using cached data.");
            return;
        }

        TrainController.cache.docs = await this.gptTrainPdf.loadPDF();
        const splitDocs = await this.gptTrainPdf.splitText(
            TrainController.cache.docs
        );

        TrainController.cache.vectorStore =
            await this.gptTrainPdf.embedAndStore(
                splitDocs,
                "src/assets/pdf/example.pdf"
            );

        console.log("Embedding and storing completed successfully");
        console.log("-------------------------");
    }

    initializeRoutes() {
        this.router.post(this.path, this.gptTrainController);
    }

    gptTrainController = async (req, res) => {
        const { file, question } = req.body;

        try {
            console.log("Training started for file: ", file);

            // Initialize the vector store if it's not already initialized
            await this.initializeVectorStore();

            console.log("Loading chain");
            console.log(typeof question);
            const response = await this.gptTrainPdf.loadChain(question);
            console.log("Chain loaded successfully");
            console.log("-------------------------");

            res.status(200).json({ message: "Success", response });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default TrainController;

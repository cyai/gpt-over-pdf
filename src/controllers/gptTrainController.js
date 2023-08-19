import express from "express";
import GPTTrainPDF from "../services/gptTrainPdf.js";

class TrainController {
    constructor() {
        this.path = "/gpt/pdf";
        this.router = express.Router();
        this.gptTrainPdf = new GPTTrainPDF();

        this.initializeRoutes();
    }

    async initializeVectorStore() {
        console.log("Embedding and storing");

        const splitDocs = await this.gptTrainPdf.splitText(
            await this.gptTrainPdf.loadPDF()
        );

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
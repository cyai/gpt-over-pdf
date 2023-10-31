import express from "express";
import GPTTrainPDF from "../services/gptTrainPdf.js";
import GPTOverPDF from "../services/gptAskPdf.js";
class TrainController {
    constructor() {
        this.path = "/gpt/pdf";
        this.router = express.Router();
        this.gptTrainPdf = new GPTTrainPDF();
        this.gptAskPdf = new GPTOverPDF();

        this.initializeRoutes();
    }

    async initializeVectorStore(file) {
        console.log("Embedding and storing");

        setTimeout(async () => {
            const splitDocs = await this.gptTrainPdf.splitText(
                await this.gptTrainPdf.loadPDF(file)
            );
            const vectorStore = await this.gptTrainPdf.embedAndStore(splitDocs);

            return vectorStore;
        }, 3000); // 3000 milliseconds (3 seconds)

        console.log("Embedding and storing completed successfully");
        console.log("-------------------------");
    }

    initializeRoutes() {
        this.router.post(this.path, this.gptTrainController);
    }

    gptTrainController = async (req, res) => {
        const { file } = req.body;

        try {
            console.log("Training started for file: ", file);

            // Initialize the vector store if it's not already initialized
            const vectorStore = await this.initializeVectorStore(file);

            console.log("Training sucess!");

            res.status(200).json({ message: "Success" });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default TrainController;
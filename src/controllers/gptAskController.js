/** @format */

import express from "express";
import GPTAskPDF from "../services/gptAskPdf.js";

class AskController {
    constructor() {
        this.path = "/gpt/pdf";
        this.router = express.Router();
        this.gptAskpdf = new GPTAskPDF();

        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post(this.path, this.gptAskController);
    }

    gptAskController = async (req, res) => {
        const { collectionName, query } = req.body;

        try {
            console.log("Loading vector store");
            const vectorstore = await this.gptAskpdf.loadVectorStore(collectionName);
            console.log("Vector store loaded successfully");
            console.log("-------------------------")

            console.log("Loading chain");
            const response = await this.gptAskpdf.loadChain(vectorstore, query);
            console.log("Chain loaded successfully");
            console.log("-------------------------")

            res.status(200).json({ message: "Success", response });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default AskController;
/** @format */

import express from "express";
import GPTOverPDF from "../services/gptAskPdf.js";

class AskController {
    constructor() {
        this.path = "/gpt/pdf";
        this.router = express.Router();
        this.gptAskpdf = new GPTOverPDF();

        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post(this.path, this.gptAskController);
    }

    gptAskController = async (req, res) => {
        const { question } = req.body;

        try {
            const response = await this.gptAskpdf.loadChain(question);
            console.log("Chain loaded successfully");
            console.log("-------------------------");

            res.status(200).json({
                message: response,
                "source-doc": response.sourceDocuments[0],
            });
        } catch (error) {
            console.error("An error occurred:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}

export default AskController;

/** @format */

// src/app.js
import express, { json } from "express";
import bodyParser from "body-parser";
import TrainController from "./src/controllers/gptTrainController.js";
import AskController from "./src/controllers/gptAskController.js";
import cors from "cors";
import fs from "fs";
import fileUpload from "express-fileupload";

class App {
    constructor() {
        this.app = express();
        this.gptTrainController = new TrainController();
        this.gptAskController = new AskController();

        this.initializeMiddlewares();
        this.initializeControllers();
    }

    initializeMiddlewares() {
        this.app.use(cors());
        //// To enable cors for specific domains remove the below comments.

        // const allowedOrigins = ["http://example1.com", "http://example2.com"]; // Add your allowed domains here

        // const corsOptions = {
        //     origin: (origin, callback) => {
        //         if (allowedOrigins.includes(origin)) {
        //             callback(null, true);
        //         } else {
        //             callback(new Error("Not allowed by CORS"));
        //         }
        //     },
        // };

        // this.app.use(cors(corsOptions)); // Enable CORS with specified options
        this.app.use(express.json());
    }

    initializeControllers() {
        bodyParser.urlencoded({ extended: true });
        bodyParser.json();
        this.app.use(bodyParser.json());
        this.app.use(fileUpload());
        // Define routes for AskController
        this.app.use("/ask", this.gptAskController.router);

        // Define routes for TrainController
        this.app.use("/train", this.gptTrainController.router);

        // Deine routes for saving file

        this.app.post("/file-upload", function (req, res) {
            var tmp_path = req.files.file;
            var target_path = "./src/assets/pdf/" + req.files.file.name;
            fs.writeFileSync(target_path, req.files.file.data, 'binary');
            // fs.rename(tmp_path, target_path, function (err) {
            //     if (err) throw err;
            //     fs.unlink(tmp_path, function () {
            //         if (err) throw err;
            //         res.send(
            //             "File uploaded to: " +
            //                 target_path +
            //                 " - " +
            //                 req.files.thumbnail.size +
            //                 " bytes"
            //         );
            //     });
            // });
        });
    }

    listen() {
        this.app.listen(8000, () => {
            console.log(`App listening on the port 8000`);
        });
    }
}

export default App;

import mongoose from "mongoose";
import dotenv from 'dotenv';
import express from "express";
import { DB_NAME } from "../constants.js";
const app = express();
dotenv.config({ path: "../env" })

const connectDB = (async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("Successfully connected to database ! !", connectionInstance.connection.host);
        app.on("error", (err) => {
            console.log("Error in while connecting from express to database ! !", err)
            throw err
        })
        app.listen(process.env.PORT, () => {
            console.log("Server is listening on port ", process.env.PORT)
        })
    }
    catch (err) {
        console.log("Error while connecting to Database");
        throw (err);
    }
})

export default connectDB;
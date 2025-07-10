import connectDB from "./db/index.js";

connectDB()

























// ; (async () => {
    //     try {
    //         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    //         console.log(`\n MongoDB connected ! ! DB HOST : ${connectionInstance.connection.host}`)
    //         app.on("error", (err) => {
    //             console.log("Error in express while connecting to database", err)
    //             throw err;
    //         })
    //         app.listen(process.env.PORT, () => {
    //             console.log("App is listening on Port ", process.env.PORT)
    //         })
    //     }
    //     catch (err) {
    //         console.log("Error in DB ", err)
    //         throw err;
    //     }
    // })
    //     ()
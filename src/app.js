import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware if server is accepting data from a web site so it is useful to allow a specific (fronend) url from client side to request data from server.

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

// Middleware if server is accepting data from client in json format so this middleware is helpful to assign limit so the limited amount of json data would be transfer to server from client

app.use(express.json({
    limit : "16kb"
}))

// Middleware is used like when requesting from client so it gives url with some long string 
// e.g;
// in
// https://www.youtube.com/watch?v=7fjOw8ApZ1I&t=21528s

// it has this below long string 

// watch?v=7fjOw8ApZ1I&t=21528s 

// so we are engaging server that this type of long string can also exist after base url so we use this below middleware
 
app.use(express.urlencoded({extended : true , limit : "16kb"}))

// Middleware to add images , videos on server (keep in mind not these are not saved on hosted url / deployment url )
app.use(express.static("public"))

// Middleware to add cookies , update cookies , del cookies or read cookies from server to client side (frontend) or sometimes access cookies from frontend to server also

app.use(cookieParser());

import userRouter from "./routes/user.route.js";

app.use("/api/v1/users" , userRouter)

export {app}
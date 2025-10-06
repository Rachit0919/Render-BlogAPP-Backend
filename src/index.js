import dotenv from 'dotenv'
dotenv.config({path: '../.env'})
import mongoose from 'mongoose'
import db from './db/index.js';
import {app} from './app.js'
import connectDB from './db/index.js';

app.on("error", (error) =>{
    console.log("ERRRR", error);
    throw error;
})

connectDB()
.then(() =>{
    const port = process.env.PORT || 8000
    app.listen(port, () =>{
        console.log("Server is running at port: ", port)
    })
})
.catch((error) =>{
    console.log("Mongo DB connection Failed !!!", error)
})




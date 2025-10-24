import dotenv from 'dotenv'
dotenv.config({path: '../../backend/.env'})
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))


app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


// import routes
import userRouter from './routes/user.routes.js'
import blogRouter from './routes/addPosts.routes.js'
import homeRouter from './routes/home.routes.js'
import allPostsRouter from './routes/allPosts.routes.js'



app.use('/api/v1/users', userRouter)
app.use('/api/v1', blogRouter)
app.use('/api/v1', homeRouter)
app.use('/api/v1', allPostsRouter)



app.use((err, req, res, next) => {
  const statusCode = err.statuscode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


export {app}
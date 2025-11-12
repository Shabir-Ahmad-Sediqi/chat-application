
import express, { Request, Response } from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import sendMessage from "./routes/message.route.js"

const app = express()
dotenv.config()
//Middlewares
app.use(express.json())

// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", sendMessage)

// A simple route for testing
app.get("/", (req: Request, res: Response) => {
    res.json({success: true, msg: "Welcome to the backend of chat app"})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is litsening on port localhost:${PORT}`)
})
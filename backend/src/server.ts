
import express, { Request, Response } from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import sendMessage from "./routes/message.route.js"
import path from "path"

dotenv.config()

const app = express();
const __dirname = path.resolve();

//Middlewares
app.use(express.json())

// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", sendMessage)

// Making the app ready for deployment.
if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("/*path", (_, res: Response) => {
        res.sendFile(path.join(__dirname, "../frontend","dist","index.html"));
    })
}

// A simple route for testing
app.get("/", (req: Request, res: Response) => {
    res.json({success: true, msg: "Welcome to the backend of chat app"})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is litsening on port http://localhost:${PORT}/`)
})
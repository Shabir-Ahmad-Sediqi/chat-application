
import express, { Request, Response } from "express"

const app = express()

//Middlewares
app.use(express.json())

const PORT = process.env.PORT || 5000

// A simple route for testing
app.get("/", (req: Request, res: Response) => {
    res.json({success: true, msg: "Welcome to the backend of chat app"})
})

app.listen(PORT, () => {
    console.log(`Server is litsening on port localhost:${PORT}`)
})
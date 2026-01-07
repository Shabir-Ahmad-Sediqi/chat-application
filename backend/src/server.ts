
import express, { Request, Response } from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import sendMessage from "./routes/message.route.js"
import userRoutes from "./routes/user.route.js"
import meRoutes from "./routes/me.route.js"
import path from "path"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from "./lib/socket.io.js"
import multer from "multer"
import imagekit from "./lib/imageKit.js"

dotenv.config()

const __dirname = path.resolve();
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isOriginAllowed = (origin?: string) => {
    if (!origin) return true;
    if (allowedOrigins.length === 0) return true;
    return allowedOrigins.includes(origin);
};

//Middlewares
app.use(express.json({limit: "5mb"}))
app.set("trust proxy", 1);
app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && !isOriginAllowed(origin)) {
        console.log("CORS blocked", { origin, path: req.path });
        return res.status(403).json({
            success: false,
            error: { code: "CORS_BLOCKED", message: "Origin is not allowed." }
        });
    }
    return next();
});
app.use(
    cors({
        origin: (origin, callback) => {
            if (isOriginAllowed(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS_BLOCKED"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type"]
    })
)
app.use(cookieParser())

// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", sendMessage)
app.use("/api/users", userRoutes)
app.use("/api/me", meRoutes)

app.get("/api/health/uploads", async (_req: Request, res: Response) => {
    const configured = Boolean(
        process.env.IMAGEKIT_PUBLIC_KEY &&
        process.env.IMAGEKIT_PRIVATE_KEY &&
        process.env.IMAGEKIT_ENDPOINT_URL
    );
    const shouldTestWrite = process.env.IMAGEKIT_HEALTHCHECK_WRITE_TEST === "true";
    let writable = configured;
    let errorMessage: string | null = null;

    if (configured && shouldTestWrite) {
        try {
            const uploadResult = await imagekit.upload({
                file: Buffer.from("health-check"),
                fileName: `health-${Date.now()}.txt`,
                useUniqueFileName: true,
                folder: "/health-checks"
            });
            if (uploadResult?.fileId) {
                await imagekit.deleteFile(uploadResult.fileId);
            }
            writable = true;
        } catch (error: any) {
            writable = false;
            errorMessage = error?.message || "Storage write test failed";
        }
    }

    return res.status(configured ? 200 : 500).json({
        success: configured,
        storage: {
            provider: "imagekit",
            configured,
            writable,
            tested: shouldTestWrite
        },
        error: errorMessage ? { message: errorMessage } : undefined
    });
});

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

app.use((err: any, _req: Request, res: Response, next: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                error: { code: "UPLOAD_TOO_LARGE", message: "File exceeds 5MB limit." }
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                error: { code: "UNSUPPORTED_FILE_TYPE", message: "Unsupported file type." }
            });
        }
    }
    if (err?.message === "CORS_BLOCKED") {
        return res.status(403).json({
            success: false,
            error: { code: "CORS_BLOCKED", message: "Origin is not allowed." }
        });
    }
    return next(err);
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server is litsening on port http://localhost:${PORT}`)
    connectDB()
})

import multer from "multer";

const parseAllowedTypes = (value?: string) =>
    value
        ? value
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [];

const allowedImageMimeTypes = parseAllowedTypes(
    process.env.ALLOWED_IMAGE_MIME_TYPES
);
const allowedFileMimeTypes = parseAllowedTypes(
    process.env.ALLOWED_FILE_MIME_TYPES
);

const isMimeTypeAllowed = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
        if (allowedImageMimeTypes.length === 0) return true;
        return allowedImageMimeTypes.includes(mimeType);
    }
    if (allowedFileMimeTypes.length === 0) return true;
    return allowedFileMimeTypes.includes(mimeType);
};

export const uploadProfileImage = multer(
    {
    storage: multer.memoryStorage(),
    limits: {fileSize: 2 * 1024 * 1024},
    fileFilter: (req: any, file: any, cb: any) => {
        if (!file.mimetype.startsWith("image/")){
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only images allowed"));
        }
        cb(null, true)
    }, 

     });

export const uploadMessageAttachments = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 5 },
    fileFilter: (req: any, file: any, cb: any) => {
        if (!file?.mimetype || !isMimeTypeAllowed(file.mimetype)) {
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "UNSUPPORTED_FILE_TYPE"));
        }
        return cb(null, true);
    }
});

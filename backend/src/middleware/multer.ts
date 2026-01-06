import multer from "multer";

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
    limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

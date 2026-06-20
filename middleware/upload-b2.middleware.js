import { _config} from "../config/config.js";
import { b2 } from "../config/b2.js"
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = [
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/mpeg",
    // PDFs
    "application/pdf"
];

export const uploadToB2 = async (req, res, next) => {
    try {
        // Check if Multer added file(s)
        if (!req.file && (!req.files || req.files.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file"
            });
        }

        const files = req.files || [req.file];

        // Validate file types and sizes
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.mimetype)) {
                // Clean up invalid file
                fs.unlinkSync(file.path);
                return res.status(400).json({
                    success: false,
                    message: `Invalid file type: ${file.mimetype}. Only videos and PDFs are allowed`
                });
            }

            if (file.size > MAX_FILE_SIZE) {
                fs.unlinkSync(file.path);
                return res.status(400).json({
                    success: false,
                    message: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed is 100MB`
                });
            }
        }

        // Authorize with B2
        await b2.authorize();

        // Get upload URL (reusable for multiple files in same batch)
        const { data: uploadUrlData } = await b2.getUploadUrl({
            bucketId: _config.bucket_id
        });

        const uploadedFiles = [];

        for (const file of files) {
            const filePath = file.path;
            const fileData = fs.readFileSync(filePath);

            // Create clean filename
            const timestamp = Date.now();
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
            const b2FileName = `uploads/${timestamp}-${safeName}`;

            // Upload to B2
            const response = await b2.uploadFile({
                uploadUrl: uploadUrlData.uploadUrl,
                uploadAuthToken: uploadUrlData.authorizationToken,
                fileName: b2FileName,
                data: fileData,
                contentType: file.mimetype
            });

            // Delete temp file after successful upload
            fs.unlinkSync(filePath);
            console.log("Temp file deleted successfully");

            // Build public URL
            const fileUrl = `https://f002.backblazeb2.com/file/${_config.bucket_name}/${b2FileName}`;

            uploadedFiles.push({
                success: true,
                fileId: response.data.fileId,
                originalName: file.originalname,
                storedName: b2FileName,
                url: fileUrl,
                size: {
                    bytes: response.data.contentLength,
                    readable: `${(response.data.contentLength / 1024 / 1024).toFixed(2)} MB`
                },
                type: file.mimetype
            });
        }

        // Attach results to request
        req.b2Uploads = uploadedFiles;
        next();

    } catch (error) {
        // Clean up all temp files on error
        const files = req.files || [req.file];
        files?.forEach(file => {
            if (file?.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        console.error("B2 upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Upload failed. Please try again.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};



export const deleteFromB2 = async (fileUrl) => {
    try {
        await b2.authorize();
        
        // Extract fileName from URL
        const urlParts = fileUrl.split('/');
        const fileName = urlParts.slice(urlParts.indexOf('file') + 2).join('/');
        
        // 1. Find the fileId first (since you don't have it stored)
        const { data: fileVersions } = await b2.listFileVersions({
            bucketId: process.env.B2_BUCKET_ID,
            startFileName: fileName,
            maxFileCount: 1
        });
        
        if (!fileVersions.files || fileVersions.files.length === 0) {
            console.log("File not found in B2:", fileName);
            return;
        }
        
        const fileId = fileVersions.files[0].fileId;
        
        // 2. Now delete using fileId + fileName
        await b2.deleteFileVersion({
            fileId: fileId,
            fileName: fileName
        });
        
        console.log("Deleted from B2:", fileName);
        
    } catch (error) {
        console.error(" B2 delete failed:", error.message);
    }
};
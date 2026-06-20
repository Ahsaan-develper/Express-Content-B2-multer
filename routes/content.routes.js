import { Router } from "express";
import { upload_File_on_multer } from "../middleware/multer.middleware.js";
import { verify_token } from "../middleware/jwt.middleware.js";
import { createUpload, delete_file, get_file, update_upload_content } from "../controller/content.controller.js";
import { uploadToB2 } from "../middleware/upload-b2.middleware.js";

const content_router = Router();


// upload an file 

content_router.post("/", verify_token , upload_File_on_multer.single("file")  , uploadToB2 , createUpload);

// get a file 

content_router.get("/" , verify_token , get_file );

// update an file 

content_router.patch("/:id" , verify_token , upload_File_on_multer.single("file") , uploadToB2 , update_upload_content);

// delete an file

content_router.delete("/:id" , verify_token  , delete_file);

export default content_router;  
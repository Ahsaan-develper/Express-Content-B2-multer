import { BadRequestError } from "../middleware/error.middleware.js";
import Content from "../models/content.model.js"
import {deleteFromB2, uploadToB2} from "../middleware/upload-b2.middleware.js"


// create an upload 


export const createUpload = async( req , res )=>{

    const { title  } = req.body;
    const fileURI = req.b2Uploads?.[0]?.url; 
    const userId = req.user?._id;
    if(!title || !fileURI || !userId){
        throw new BadRequestError("Please fill all fields")
    }

    try{

        const upload =await Content.create({
            title ,
            file  : fileURI,
            user : userId 
        });

        res.status(201).json({
            message : "File is upload ",
            data : {
                _id  : upload._id,
                file : upload.file
            }
        });

    }catch(err){
        throw err;
    }

}


// get a file 


export const get_file = async (req, res)=>{
    const { title } = req.body;

    if (!title){
        throw new BadRequestError("Title is not given");
    }

    try {

        const data = await Content.findOne({title});

        if(!title){
            throw new NotFoundError("Title is not found");
        }

        res.status(200).json({
            data : {
                _id : data._id,
                title : data.title,
                file : data.file
            }
        })

    }catch(err){
        throw err;
    }
}





export const update_upload_content = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.user?._id;
    const newFile = req.b2Uploads?.[0]?.url;  // From B2 middleware (if file uploaded)

    if (!id) {
        throw new BadRequestError("Content ID is required");
    }

    if (!title && !newFile) {
        throw new BadRequestError("Please provide title or file to update");
    }

    try {
        // Find existing content
        const content = await Content.findById(id);

        if (!content) {
            throw new NotFoundError("Content not found");
        }

        // Check ownership
        if (content.user.toString() !== userId.toString()) {
            throw new UnauthorizedError("Not authorized to update this content");
        }

        const updateData = {};

        // Update title if provided
        if (title) {
            updateData.title = title;
        }

        // Update file if new file was uploaded
        if (newFile) {
            // Delete old file from B2 (optional but saves storage)
            if (content.file) {
                await deleteFromB2(content.file);
            }
            updateData.file = newFile;
        }

        // Update in database
        const updatedContent = await Content.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Content updated successfully",
            data: updatedContent
        });

    } catch (err) {
        throw err;
    }
};


// delete an file 

export const delete_file = async(req , res) =>{
    const {id} = req.params ;
    if(!id){
        throw new BadRequestError(" Id not given");
    }

    try {

        const content = await Content.findById(id);

        if(!content){
             throw new BadRequestError(" Data not find");
        }

       console.log(content);
       

       await deleteFromB2(content.file);
        await Content.findByIdAndDelete(id );

        res.status(200).json({
            message  : "File is deleted"
        })
    }catch(err){
        throw err;
    }
}



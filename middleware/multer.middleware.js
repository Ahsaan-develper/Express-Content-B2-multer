import multer  from "multer";


const storage = multer.diskStorage({
    destination : function( req , file , cb){
        cb (null , "public/temp");
    },
    filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix)
}

})


export  const upload_File_on_multer = multer({
    storage  : storage,
    limits : { fileSize : 100 * 1024 * 1024}
})


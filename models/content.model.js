import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    title : { type :String , required : true},
    file : { type :String , required : true},
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true 
    }
} , {timestamps : true })


export default mongoose.model ("Content" , contentSchema);
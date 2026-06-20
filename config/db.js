import mongoose from "mongoose";
import { _config } from "./config.js";


export const DB_connection = async()=>{
    try{
         mongoose.connection.on("connected", ()=>{
            console.log("Database is connected !!!");            
        });

         mongoose.connection.on("disconnected" , ()=>{
            console.log('Database is disconnected');
        })

         mongoose.connection.on ("close" , ()=>{
            console.log("DB is close !!!");
        })


        await mongoose.connect(_config.mongo_string);


    }catch(err){
        throw err;
    }
};

export const disconnect_DB = async()=>{
    await mongoose.disconnect(_config.mongo_string);
}
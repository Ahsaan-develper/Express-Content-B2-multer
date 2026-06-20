import dotenv from "dotenv";


dotenv.config();


// create .env config


export const _config = {
    mongo_string : process.env.MONGO_STRING,
    node_env : process.env.NODE_ENV,
    Port  : process.env.Port,
    access_token : process.env.ACCESS_TOKEN,
    refresh_token : process.env.REFRESH_TOKEN,
    b2_key_id : process.env.B2_KEY_ID,
    b2_key : process.env.B2_MASTER_KEY,
    bucket_name : process.env.BUCKET_NAME,
    bucket_id : process.env.BUCKET_ID
}




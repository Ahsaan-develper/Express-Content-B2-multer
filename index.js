import express, { json } from "express"
import { _config } from "./config/config.js";
import { DB_connection, disconnect_DB } from "./config/db.js";
import user_router from "./routes/user.routes.js";
import content_router from "./routes/content.routes.js";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(async (req, res , next)=>{
    await DB_connection;
    next();
})
// user
app.use("/user", user_router);

//upload 
app.use("/upload" , content_router);


// connection for server

// const connectServer = async ()=>{
//     await DB_connection();
//     app.listen(_config.Port  , ()=>{
//         console.log("Server is running on port ", _config.Port);
        
//     });

//     process.on ("SIGINT" ,async ()=>{
//         await disconnect_DB;

//         process.exit(1);
//     })
// }


if (_config.node_env !== "production"){
    const create_server = async()=>{
        await DB_connection();
        app.listen(_config.Port, ()=>{
             console.log("Server is running on port", _config.Port);
        })
    }

    create_server();
}

// connectServer();
export default app;
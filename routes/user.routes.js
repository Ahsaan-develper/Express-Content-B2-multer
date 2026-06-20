import { Router } from "express";
import { delete_user, login_user, register_user, update_user } from "../controller/user.controller.js";


const user_router = Router();

// register user 

user_router.post("/" , register_user);

// login user 

user_router.get("/" , login_user);

// update data of user 

user_router.patch("/:id" , update_user);

// delete an user 

user_router.delete("/:id" , delete_user)

export default user_router;
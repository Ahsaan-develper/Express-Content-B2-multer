import { generate_access_token, generate_refresh_token } from "../middleware/jwt.middleware.js";
import { _config } from "../config/config.js";
import { BadRequestError, ConflictError, NotFoundError } from "../middleware/error.middleware.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt"



// create new user 


export const register_user  = async (req , res )=>{
    const {  name , email , password } = req.body ;
    if (!name || !email || !password){
        throw new BadRequestError("Please fill all fields ");
    }

    try {

        const existing_email = await User.findOne({email});

        if (existing_email){
            throw new ConflictError("Email already register ")
        }

        const hashed_password = await bcrypt.hash(password , 10);

        const new_user = await User.create({
            name ,
            email ,
            password : hashed_password
        });

        const access_token = generate_access_token(new_user._id);
        const refresh_token = generate_refresh_token(new_user._id)
        new_user.refresh_token = refresh_token;

        res.cookie("refresh_token", refresh_token,{
            httpOnly : true,
            maxAge : 7 *   60 * 60 * 1000
        })

          res.status(201).json({access_token  : access_token , 
            user : {
                _id : new_user._id ,
                name : new_user.name ,
                email : new_user.email
            }
          });
    }catch(err){
        throw err;
    }

}


// get a user 

export const login_user = async ( req , res )=>{
   
    const {email , password} = req.body;

    if(!email || !password){
        throw new BadRequestError(" Please fill all fields ");
    }

    try{

        const user = await User.findOne({email});
        if(!user){
            throw new NotFoundError("Email is wrong !!!");
        }

        const is_match = await bcrypt.compare(password , user.password);

        if(!is_match){
            throw new NotFoundError(" Password not match !!!");
        }

        const access_token = generate_access_token(user._id);
        const refresh_token = generate_refresh_token(user._id);

        user.refresh_token = refresh_token;
        await user.save();

        res.cookie("refresh_token", refresh_token,{
            httpOnly  : true ,
            maxAge : 7 *60 * 60 * 1000
        })

        res.status(200).json({
            access_token : access_token, 
            user  : {
                _id : user._id,
                name : user.name,
                email : user.email,
            }
        })
    }catch (err){
        throw err;
    }
}


// update an user 
export const update_user = async (req, res) => {
    const { name, email, password } = req.body;
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError("Id not given");
    }

    // Check if at least one field is provided (PATCH allows partial updates)
    if (!name && !email && !password) {
        throw new BadRequestError("Please provide at least one field to update");
    }

    try {
        const existing_user = await User.findById(id);

        if (!existing_user) {
            throw new NotFoundError("User does not exist");
        }

        // Build update object dynamically — only includes fields that were sent
        const updateFields = {};
        
        if (name) updateFields.name = name;
        
        if (email) {
            // Optional: check if new email already belongs to another user
            const emailTaken = await User.findOne({ email, _id: { $ne: id } });
            if (emailTaken) {
                throw new ConflictError("Email already in use by another account");
            }
            updateFields.email = email;
        }
        
        if (password) {
            const hashed_password = await bcrypt.hash(password, 10);
            updateFields.password = hashed_password;
        }

        // Update only the provided fields
        const updated_user = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true } // return updated doc, run schema validators
        );

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updated_user
        });

    } catch (err) {
        throw err;
    }
};

//  delete an user 
export const delete_user = async (req, res) => {
    const { id } = req.params;

    // 1. Validate ID exists in params
    if (!id) {
        throw new BadRequestError("User ID is required");
    }

    try {
        // 2. Check if user exists
        const user = await User.findById(id);
        
        if (!user) {
            throw new NotFoundError("User not found");
        }

      

        // 4. Real scenario cleanup: handle related data before deleting user
     
        if (req.user._id.toString() === id) {
            res.clearCookie("refresh_token", {
                httpOnly: true,
                secure: _config.node_env === "production",
                sameSite: "strict"
            });
        }

        // 5. Delete the user
        await User.findByIdAndDelete(id);

        // 6. Respond
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        throw err;
    }
};
import {_config} from "../config/config.js";
import { BadRequestError } from "./error.middleware.js"
import jwt from "jsonwebtoken";




export const generate_access_token = (user_id)=>{
    if(!user_id){
        throw new BadRequestError("User id for jwt not given");
    }

    return jwt.sign({sub : user_id.toString()} , _config.access_token , {"expiresIn" : "25min"});
}


export const generate_refresh_token = (user_id)=>{
  if(!user_id){
        throw new BadRequestError("User id for jwt not given");
    }
    return jwt.sign({sub : user_id.toString()} , _config.refresh_token  , {"expiresIn" : "7d"})
}



export const verify_token = ( req , res , next )=>{
    const authHeaders = req.headers.authorization;

    if (!authHeaders){
        return res.status(401).json({message : "Headers is 'Authorization' is missing"});
    }

    if (!authHeaders.startsWith("Bearer ")){
        return res.status(401).json({message : "Headers not strta with 'Bearer '"});
    }

    const token = authHeaders.split(" ")[1];
    try {

        const decoded =  jwt.verify(token, _config.access_token);

        req.user_id = decoded.sub;
        req.user = { _id: decoded.sub };
        next();

    }catch(err){
              return res.status(403).json({ message: "Invalid or expired token" });
    }
}


    export const refresh_handler = async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token" });
        }

        try {
            const decoded = jwt.verify(refreshToken, _config.jwt_Refresh_Secret);
            const user = await User.findById(decoded.sub);

            if (!user || user.refresh_token !== refreshToken) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            // Issue new tokens
            const new_access_token = generate_access_token(user._id);
            const new_refresh_token = generate_refresh_token(user._id);

            user.refresh_token = new_refresh_token;
            await user.save();

            res.cookie("refreshToken", new_refresh_token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({ access_token: new_access_token });

        } catch (err) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
    };
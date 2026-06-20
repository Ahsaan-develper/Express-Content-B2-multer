import B2 from "backblaze-b2";
import { _config } from "./config.js";

export  const b2 = new B2({
    applicationKeyId : _config.b2_key_id ,
    applicationKey :  _config.b2_key
})
import CryptoJS from "crypto-js";


export function MD5(arg : string) : string
{
    return CryptoJS.MD5(arg).toString();
}



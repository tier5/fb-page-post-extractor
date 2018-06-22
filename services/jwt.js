/**
 * jwt
 * @description :: Helper funtion for all jwt 
 */


const jwt = require('jsonwebtoken');


module.exports = {
   createUsersToken,
   verifyToken
}
/**
 * Function to create token 
 * @param {object} obj 
 * @return token
 */
function createUsersToken(obj){
   if(obj){
       return jwt.sign(obj,"f**kthebitch00#1",{ expiresIn: 60 * 60 * 24 });
   }
}

/**
 * Function to verify token 
 * @param {string} token 
 * @return promise 
 */
function verifyToken(token){

   return new Promise((resolve,reject)=>{
       jwt.verify(token, "f**kthebitch00#1",function(err, decoded){
           if(!err){
               resolve(decoded);
           } else {
               reject(err);
           }
       })
   })
}


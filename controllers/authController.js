/**
 * authController.js
 * @description This file is for authentication
 * 
 */

 //const bcrypt = require('bcrypt');
 const {createUsersToken} = require('../services/jwt');
 const {Users}= require('../models/index');

 async function login(req,res) {

    let {email,password} = req.body;
    try {

        let user = await Users.findOne({email}).select({ email:1,password:1});

        if(!user) { 
            return res.status(400).send({message : "Either the usersname or password is incorrect!", status: false})
        }

        var decoded = await bcrypt.compare(password, user.password);

        if (decoded) {

            let token = createUsersToken({email : user.email});
            return res.status(200).send({message : "ok", status: true, token})

        } else {

            return res.status(400).send({message : "Either the usersname or password is incorrect!", status: false})
        }
        
    } catch (error) {
        //console.log(error);
        res.status(500).send({message : "Something went wrong!", status: false})
    }
}
 module.exports = {
     login
 }
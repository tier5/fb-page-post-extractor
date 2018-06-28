/**
 * hooksController.js
 * @description Controller for all the webhooks to the api
 */
 const generator = require('generate-password');
 const {Users} = require('../models/index');
 
/**
 * Function to delete an account
 * @param {object} req 
 * @param {object} res 
 */
 function deleteUserFromHook (req, res) {
    let email = req.body.email || req.params.email;
    var token = req.body.token ;
    let testTokenNumber  =  '0987654321';
    // checking token 
    if(!token || token != testTokenNumber){
        return res.status(200).send({status :false , message : 'Token mismatch!'})
    };
    // checking email
    if (!email){ return res.status(200).send({message : 'email is required!' , status : false})};
    Users.findOneAndRemove({
        email : email
    }).then(removed => {
        if (!removed) { return res.status(200).send({status : false , message : 'Account not found!'})}
        return res.status(200).send({ status :true , message : 'Account deleted!'});
    }).catch(error=> {
        return res.status(200).send({message : 'Server Internal Error!', status:false});
    })
 };

 /**
 * Function to unsuspend an account
 * @param {object} req 
 * @param {object} res 
 */
function unsuspendUserFromHook (req, res) {
    var token = req.body.token ;
    let testTokenNumber  =  '0987654321';
    var email = req.body.email;
    // checking token 
    if(!token || token != testTokenNumber){
        return res.status(200).send({status :false , message : 'Token mismatch!'})
    };
    // checking email
    if (!email){ return res.status(200).send({message : 'email is required!' , status : false})};
    let ckeckSuspendedEmail = email + '_suspend';
    Users.findOneAndUpdate({
        email : ckeckSuspendedEmail
    },
    {
        $set :{
            email : email
        }
    }).then(updated =>{
        if (!updated) { return res.status(200).send({ status : false , message : 'Account not found!'})}
        return res.status(200).send({status : true , message : 'Account unsuspended'});
    }).catch(error=>{
        return res.status(200).send({message : 'Server Internal Error!', status:false});
    })
  }
  
  /**
   * Function to suspend an account
   * @param {object} req 
   * @param {object} res 
   */
  function suspendUserFromHook(req, res) {
    var token = req.body.token ;
    let testTokenNumber  =  '0987654321';
    var email = req.body.email;
    // checking token 
    if(!token || token != testTokenNumber){
        return res.status(200).send({status :false , message : 'Token mismatch!'})
    };
    // checking email
    if (!email){ return res.status(200).send({message : 'email is required!' , status : false})};
    
    Users.findOneAndUpdate({
        email : email
    },
    {
        $set :{
            email : email + "_suspend"
        }
    }).then(updated =>{
        if (!updated) { return res.status(200).send({status : false , message : 'Account not found!'})}
        return res.status(200).send({ status :true , message : 'Account suspended'});
    }).catch(error=>{
        return res.status(200).send({message : 'Server Internal Error!', status:false});
    })
  }

  /**
   * Function to create a new user from hook
   * @param {object} req 
   * @param {object} res 
   */
  async function createUserFromHook(req, res){
    let requestToken = req.body.token || req.header.token;
    let {email} = req.body;
    if (requestToken === undefined || requestToken !== '0987654321'){
        return res.status(200).send({message : 'Unauthorized',status: false})
    } 
    var password = generator.generate({
        length: 10,
        numbers: true
    });
    let user = {email,password};
    Users.create(user)
        .then(info => {
            return res.send({message : 'User created', username: user.email, password : password, status: true});
        }).catch(error => {
    
            return res.status(200).send({message:'Bad Request', status: false});
        })
  }

 module.exports = {
    deleteUserFromHook,
    unsuspendUserFromHook,
    suspendUserFromHook,
    createUserFromHook
 }
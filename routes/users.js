var express = require('express');
var router = express.Router();
const generator = require('generate-password');
const {Users} = require('../models/index');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const {createUsersToken} = require('../services/jwt');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 * POST users create
 */
router.post('/create',async (req,res,next)=>{
  let requestToken = req.body.token || req.header.token;
  let {email} = req.body;
  if (requestToken === undefined || requestToken !== '0987654321'){
    return res.status(401).send({message : 'Unauthorized',status: false})
  } 
  var password = generator.generate({
    length: 10,
    numbers: true
  });
  let user = {email,password};
  Users.create(user).then(info => {
   return res.send({message : 'User created', username: user.email, password : password, status: true});
  }).catch(e => {
    console.log(e);
    res.status(400).send({message:'Bad Request', status: false});
  })
});

router.post('/login', async (req,res,next) => {
  let {email,password} = req.body;
  try {
    let user = await Users.findOne({email}).select({ email:1,password:1});;
    if(!user) { 
      return res.status(400).send({message : "Either the usersname or password is incorrect!", status: false})
    }
    var decoded = await bcrypt.compare(password, user.password);
        if (decoded) {
          let token = createUsersToken({email : user.email});
          res.status(200).send({message : "ok", status: true, token})
        } else {
          res.status(400).send({message : "Either the usersname or password is incorrect!", status: false})
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send({message : "Something went wrong!", status: false})
  }
});

/**
 * Route to delete user from the application
 * @param {object} request
 * @param {object} response
 * @returns response
 */
router.post("/delete",function(req,res,next){
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
    console.log(removed);
    if (!removed) { return res.status(200).send({status : false , message : 'Account not found!'})}
    return res.status(200).send({ status :true , message : 'Account deleted!'});
  }).catch(error=>{
    console.log(error);
    return res.status(200).send({message : 'Server Internal Error!', status:false});
  })
  
});


// route to suspend and unsuspend accout
router.post("/suspend",suspendUserFromHook);
router.post("/unsuspend",unsuspendUserFromHook);

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
      return res.status(400).send({http_code : 400, status :'error' , message : 'Token mismatch!'})
  };
  // checking email
  if (!email){ return res.status(400).send({message : 'email is required!' , status : false})};
  
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




module.exports = router;

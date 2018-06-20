var express = require('express');
var router = express.Router();
const generator = require('generate-password');
const {Users} = require('../models/index');
const bcrypt = require('bcrypt');
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
          res.status(200).send({message : "ok", status: true})
        } else {
          res.status(400).send({message : "Either the usersname or password is incorrect!", status: false})
    }
    
  } catch (error) {
    res.status(500).send({message : "Something went wrong!", status: false})
  }
  
})

module.exports = router;

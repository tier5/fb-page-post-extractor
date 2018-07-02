const router                        = require('express').Router();
const { login }                     = require('../controllers/authController');
const { deleteUserFromHook, 
        suspendUserFromHook, 
        unsuspendUserFromHook, 
        createUserFromHook}         = require('../controllers/hooksController');
const {getPagePosts}                = require('../controllers/pageController');
const {verifyToken}                 = require('../services/jwt');
const {Users}                       = require('../models/index');



router.post("/users/login", login);


// webhooks for zapier integrations

router.post("/users/create",createUserFromHook);
router.post("/users/delete",deleteUserFromHook);
router.post("/users/suspend",suspendUserFromHook);
router.post("/users/unsuspend",unsuspendUserFromHook);

router.post('/posts',isAuthenticated,getPagePosts);

/**
 * Function to check authentication 
 */
function isAuthenticated(req, res, next) {
    let token = req.body.token || req.headers.token || req.headers.authoriztion;
    
    verifyToken(token).then(decoded => {
        Users.findOne({email : decoded.email}).then(user => {
            req.user = user ;
            next();
        }).catch(err=>{
            console.log(err)
            return res.status(500).send({status: false, message : 'error'})
        })

    }).catch(err => {
        console.log(err);
       return res.status(401).send({status: false, message : 'Unauthorized'})
    })
}

module.exports = router;

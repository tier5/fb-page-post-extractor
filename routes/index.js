const router                        = require('express').Router();
const { login }                     = require('../controllers/authController');
const { deleteUserFromHook, 
        suspendUserFromHook, 
        unsuspendUserFromHook, 
        createUserFromHook}         = require('../controllers/hooksController');
const {getPagePosts}                = require('../controllers/pageController');
const {verifyToken}                 = require('../services/jwt');

const passportFacebook              = require('../socialAuth/facebookLogin');



router.post("/users/login", login);


// webhooks for zapier integrations

router.post("/users/create",createUserFromHook);
router.post("/users/delete",deleteUserFromHook);
router.post("/users/suspend",suspendUserFromHook);
router.post("/users/unsuspend",unsuspendUserFromHook);

router.post('/posts',isAuthenticated,getPagePosts);

router.get('/auth/facebook', passportFacebook.authenticate('facebook',{ scope: ['manage_pages', 'pages_show_list', 'publish_pages','email']}));
router.get('/auth/facebook/callback',
    passportFacebook.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
        // Successful authentication, redirect home.
        var fullUrl = req.protocol + '://' + req.get('host');
        //var token = jwt.sign({id:user.provider_id,email:user.email}, "test",{ algorithm: 'HS256', expiresIn: 60*60*24 });
        res.redirect(fullUrl + '/dashboard?token=true');
        //res.status(200).send({message : 'success', status : true});
    });

/**
 * Function to check authentication 
 */
function isAuthenticated(req, res, next) {
    let token = req.body.token || req.headers.token || req.headers.authoriztion;
    
    verifyToken(token).then(decoded => {
        next();
    }).catch(err => {
       return res.status(401).send({status: false, message : 'Unauthorized'})
    })
}

module.exports = router;

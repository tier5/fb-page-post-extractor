const router                        = require('express').Router();
const { login }                     = require('../controllers/authController');
const { deleteUserFromHook, 
        suspendUserFromHook, 
        unsuspendUserFromHook, 
        createUserFromHook}         = require('../controllers/hooksController');
const {getPagePosts, getPageStatsOverall}  = require('../controllers/pageController');
const {verifyToken}                 = require('../services/jwt');
const {Users}                       = require('../models/index');
const {Pages}   = require('../models/index');
const moment    = require("moment");


router.post("/users/login", login);


// webhooks for zapier integrations

router.post("/users/create",createUserFromHook);
router.post("/users/delete",deleteUserFromHook);
router.post("/users/suspend",suspendUserFromHook);
router.post("/users/unsuspend",unsuspendUserFromHook);

router.post('/posts',isAuthenticated,getPagePosts);
//router.get('/posts', getPageStats);
router.get('/posts/stats',getPageStatsOverall)


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
let node_xj = require("xls-to-json");
const csv = require('csvtojson');

router.get("/testing", (req, res, next)=>{
    
    csv()
        .fromFile("./posts.csv")
        .then((jsonObj)=>{
            
            let posts =jsonObj.map(elem=>{
                elem.year = moment(elem.created_time).format('YYYY')
                return elem
            });

            Pages.create({
                user : "5b36698b5483241f7d8bf0ca",
                pageUrl: "testingdata",
                pageId: "221212121",
                posts: posts
            }).then(docs=>{
                console.log(docs);
            }).catch(err=>{
                console.log(err);
            })
            /**
             * [
             * 	{a:"1", b:"2", c:"3"},
             * 	{a:"4", b:"5". c:"6"}
             * ]
             */ 
        })
    // Pages.aggregate([
    //     {
    //         $match: {
    //             pageUrl : "testingdata"
    //         }
    //     },
    //     {
    //         $project:{
    //             "posts": 1,
    //             "_id": 0
    //         }
    //     },
    //     {
    //         $unwind : "$posts",
    //     },
    //     {
    //         $project : {
    //             comments : "$posts.comments.summary.total_count",
    //             likes : "$posts.likes.summary.total_count",
    //             reactions :"$posts.reactions.summary.total_count",
    //             year : "$posts.year"
    //         }
    //     },
    //     {
    //         $group : {
    //             _id : {  year : "$year" },
    //             all_comments: {
    //                 $push : "$comments"
    //             }
    //         }
    //     },
    //     {
    //         $project : {
    //             all_comments : 1,
    //             total_count : {$isArray : "$all_comments"},
    //             total_count_val: { $sum : "$all_comments" }
    //         }
    //     },
    // ]).then(docs=>{
    //     if (!docs) {
    //         return res.status(400).send({message : 'Bad Request', status : false})
    //     }
    //     return res.status(200).send({message : "ok", status : true, data : docs})
    // }).catch(err=>{
    //     res.send(err)
    //     return res.status(500).send({ message : 'Something went wrong!', status : false})
    // })
})

module.exports = router;
